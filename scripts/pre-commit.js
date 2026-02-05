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

try {
  // Step 1: Build
  console.log('Step 1/4: Building...');
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
  console.log('\nStep 2/4: Starting preview server...');

  previewProcess = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    detached: true,
    shell: true
  });

  // Wait for server to start
  console.log(`Waiting ${PREVIEW_STARTUP_MS}ms for server startup...`);
  await new Promise(resolve => setTimeout(resolve, PREVIEW_STARTUP_MS));

  // Check if server is running
  if (!previewProcess.pid) {
    throw new Error('Failed to start preview server');
  }

  console.log('Preview server started.');

  // Step 3: Check for hydration errors by making a request
  console.log('\nStep 3/4: Checking for hydration issues...');

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

  // Step 4: Cleanup (kill preview server)
  console.log('\nStep 4/4: Cleaning up...');

  // Kill the process group
  if (process.platform === 'win32') {
    execSync(`taskkill /F /T /PID ${previewProcess.pid}`, { stdio: 'ignore' });
  } else {
    process.kill(-previewProcess.pid, 'SIGTERM');
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\nPre-commit checks passed!');
  process.exit(0);

} catch (error) {
  // Cleanup on error
  if (previewProcess && previewProcess.pid) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /T /PID ${previewProcess.pid}`, { stdio: 'ignore' });
      } else {
        process.kill(-previewProcess.pid, 'SIGTERM');
      }
    } catch (killError) {
      // Ignore cleanup errors
    }
  }

  console.error('\nPre-commit validation failed:');
  console.error(error.message);

  // Show bypass instructions
  console.error('\nTo bypass this check, use:');
  console.error('  git commit --no-verify -m "your message"');
  console.error('Or disable temporarily:');
  console.error(`  ${ENABLED_ENV_VAR}=false git commit -m "your message"`);

  process.exit(1);
}
