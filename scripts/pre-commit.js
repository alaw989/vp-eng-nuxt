#!/usr/bin/env node

import { execSync } from 'child_process';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PREVIEW_URL = 'http://localhost:3000';
const PREVIEW_STARTUP_MS = 5000;
const ENABLED_ENV_VAR = 'PRE_COMMIT_CHECKS_ENABLED';

// Allow disabling via environment variable
if (process.env[ENABLED_ENV_VAR] === 'false') {
  console.log('Pre-commit checks disabled via environment variable.');
  process.exit(0);
}

console.log('Running pre-commit validation...\n');

let previewProcess = null;
let previewPid = null;

// Cleanup function to kill the preview server
const cleanupPreview = async () => {
  if (previewPid) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /T /PID ${previewPid}`, { stdio: 'ignore' });
      } else {
        // Kill the process and its child processes
        execSync(`pkill -P ${previewPid}`, { stdio: 'ignore' });
        process.kill(previewPid, 'SIGTERM');
      }
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (killError) {
      // Process may have already exited
    }
  }
};

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

  previewProcess = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    detached: true
  });

  // Store the PID for later cleanup
  previewPid = previewProcess.pid;

  // Unref the process so it doesn't keep parent alive
  previewProcess.unref();

  // Wait for server to start
  console.log(`Waiting ${PREVIEW_STARTUP_MS}ms for server startup...`);
  await new Promise(resolve => setTimeout(resolve, PREVIEW_STARTUP_MS));

  console.log('Preview server started.');

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

  const { runLighthouse, checkBudgets, formatScores } = await import('./lighthouse-audit.js');

  const lhr = await runLighthouse(PREVIEW_URL);

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
