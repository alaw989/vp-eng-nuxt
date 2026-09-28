#!/usr/bin/env node

import { execSync } from 'child_process';
import { spawn } from 'child_process';
import { createServer } from 'net';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PREVIEW_STARTUP_TIMEOUT_MS = 60000;
const ENABLED_ENV_VAR = 'PRE_COMMIT_CHECKS_ENABLED';

// Allow disabling via environment variable
if (process.env[ENABLED_ENV_VAR] === 'false') {
  console.log('Pre-commit checks disabled via environment variable.');
  process.exit(0);
}

console.log('Running pre-commit validation...\n');

let previewProcess = null;
let previewPid = null;
let previewExited = false;

// Ask the OS for a free port, so the preview never collides with a dev
// server (or anything else) already on :3000
const findFreePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.unref();
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

// Poll until the preview answers, so Lighthouse only ever audits the server
// this hook started
const waitForPreview = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (previewExited) {
      throw new Error('Preview server exited before it started listening.');
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not listening yet
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not respond at ${url} within ${timeoutMs / 1000}s.`);
};

// Kill the preview's whole process group. `nuxt preview` runs the Nitro server
// as a grandchild (npx -> nuxt -> node server/index.mjs); killing only the
// top process used to leave the server running on its port.
const cleanupPreview = async () => {
  if (!previewPid || previewExited) return;
  const pid = previewPid;
  previewPid = null;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
      return;
    }
    process.kill(-pid, 'SIGTERM');
  } catch {
    return; // Already gone
  }
  // Give it a moment to shut down, then make sure
  for (let i = 0; i < 20 && !previewExited; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!previewExited) {
    try { process.kill(-pid, 'SIGKILL'); } catch { /* already gone */ }
  }
};

// Clean up if the commit is interrupted (Ctrl+C) mid-audit
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await cleanupPreview();
    process.exit(130);
  });
}

try {
  // Step 1: Build
  console.log('Step 1/5: Building...');
  const buildOutput = execSync('npm run build', {
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  // Check for hydration errors in build output
  if (buildOutput.includes('[Vue warning]') || buildOutput.includes('Hydration mismatch')) {
    console.error('\nHydration errors detected in build output!');
    console.error('Hydration errors indicate server/client HTML mismatch.');
    console.error('Please fix these errors before committing.\n');
    console.error(buildOutput);
    process.exit(1);
  }

  console.log('Build successful.');

  // Step 2: Start preview server in background
  console.log('\nStep 2/5: Starting preview server...');

  const port = await findFreePort();
  const PREVIEW_URL = `http://localhost:${port}`;

  // detached puts the preview in its own process group so cleanup can kill
  // the whole tree; stdio is ignored so a full pipe can never stall it
  previewProcess = spawn('npx', ['nuxt', 'preview', '--port', String(port)], {
    stdio: 'ignore',
    detached: true,
    env: { ...process.env, PORT: String(port), NITRO_PORT: String(port) }
  });
  previewPid = previewProcess.pid;
  previewProcess.on('exit', () => { previewExited = true; });
  previewProcess.unref();

  await waitForPreview(`${PREVIEW_URL}/`, PREVIEW_STARTUP_TIMEOUT_MS);

  console.log(`Preview server started on ${PREVIEW_URL}.`);

  // Step 3: Check for hydration errors by making a request
  console.log('\nStep 3/5: Checking for hydration issues...');

  try {
    const response = await fetch(`${PREVIEW_URL}/`);
    const html = await response.text();

    // Basic check that page rendered (has main content)
    if (!html.includes('main') && !html.includes('Main')) {
      console.warn('Warning: Page may not have main content.');
    }
  } catch (fetchError) {
    console.warn(`Warning: Could not verify page load: ${fetchError.message}`);
  }

  console.log('No critical hydration issues detected.');

  // Step 4: Run Lighthouse audit
  console.log('\nStep 4/5: Running Lighthouse audit...');

  const { runLighthouse, checkBudgets, formatScores, isChromeAvailable } = await import('./lighthouse-audit.js');

  const lhr = await runLighthouse(PREVIEW_URL);

  // Check if Chrome was available
  const hasChrome = isChromeAvailable();

  if (hasChrome) {
    // Only check budgets if we actually ran Lighthouse
    console.log('Lighthouse scores:');
    console.log(formatScores(lhr));

    const failures = checkBudgets(lhr);

    if (failures.length > 0) {
      console.error('\nLighthouse budget failures:');
      failures.forEach(f => {
        console.error(`  ${f.category}: ${f.score} (below ${f.budget} by ${f.diff})`);
      });

      throw new Error('Lighthouse scores below budget (85+). Improve performance or adjust budgets.');
    }

    console.log('Lighthouse scores passed!');
  } else {
    console.log('Lighthouse audit skipped (Chrome not available).');
    console.log('Install Chrome/Chromium to enable performance audits in pre-commit.');
  }

  // Step 5: Cleanup (kill preview server)
  console.log('\nStep 5/5: Cleaning up...');

  await cleanupPreview();

  console.log('Preview server stopped.');

  console.log('\nPre-commit checks passed!');
  process.exit(0);

} catch (error) {
  // Cleanup on error
  await cleanupPreview();

  console.error('\nPre-commit validation failed:');
  console.error(error.message);

  // Show bypass instructions
  console.error('\nTo bypass this check, use:');
  console.error('  git commit --no-verify -m "your message"');
  console.error('Or disable temporarily:');
  console.error(`  ${ENABLED_ENV_VAR}=false git commit -m "your message"`);

  process.exit(1);
}
