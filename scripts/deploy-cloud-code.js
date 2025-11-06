#!/usr/bin/env node
// Quick deploy script for cloud code using Back4App CLI
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying cloud code to Back4App...\n');

// Check if b4a CLI is installed
try {
  execSync('b4a --version', { stdio: 'ignore' });
  console.log('✅ Back4App CLI found\n');
} catch (error) {
  console.log('❌ Back4App CLI not installed. Installing now...\n');
  try {
    execSync('npm install -g back4app-cli', { stdio: 'inherit' });
    console.log('\n✅ Back4App CLI installed\n');
  } catch (installError) {
    console.error('Failed to install Back4App CLI. Install manually:');
    console.error('npm install -g back4app-cli\n');
    process.exit(1);
  }
}

// Deploy
try {
  console.log('Deploying cloud/main.js...\n');
  
  // You need to configure b4a first with: b4a configure
  execSync('b4a deploy', { stdio: 'inherit', cwd: __dirname + '/..' });
  
  console.log('\n✅ Cloud code deployed successfully!\n');
  console.log('Now test with: node scripts/test-blood-request.js\n');
} catch (error) {
  console.error('\n❌ Deployment failed.');
  console.error('\nManual deployment required:');
  console.error('1. Go to https://dashboard.back4app.com');
  console.error('2. Select your app');
  console.error('3. Go to Cloud Code section');
  console.error('4. Upload cloud/main.js');
  console.error('5. Click Deploy\n');
  process.exit(1);
}
