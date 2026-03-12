/**
 * Azure Deployment Preparation Script
 * This script helps verify that the project is ready for deployment to Azure.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('🚀 Preparing for Azure Deployment...');

function checkEnv(dir, envFile = '.env') {
  const envPath = path.join(dir, envFile);
  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Warning: ${envFile} not found in ${dir}`);
    return false;
  }
  console.log(`✅ ${envFile} found in ${dir}`);
  return true;
}

function verifyBuild() {
  console.log('📦 Verifying frontend build...');
  try {
    process.chdir(frontendDir);
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build successful');
  } catch (error) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  } finally {
    process.chdir(rootDir);
  }
}

// 1. Check Backend Environment
console.log('\n--- Step 1: Backend Prep ---');
checkEnv(backendDir);

// 2. Check Frontend Environment
console.log('\n--- Step 2: Frontend Prep ---');
checkEnv(frontendDir);

// 3. Verify Frontend Build
console.log('\n--- Step 3: Build Verification ---');
// Uncomment this if you want to run build automatically
// verifyBuild();
console.log('Note: Run "npm run build" in the "frontend" directory before deploying to Static Web Apps.');

console.log('\n✨ Preparation complete! Follow the instructions in walkthrough.md for the next steps.');
