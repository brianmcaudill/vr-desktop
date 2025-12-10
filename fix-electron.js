#!/usr/bin/env node
// Electron Installation Fix Script
// This script ensures Electron is properly installed on Windows

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Ensuring Electron is properly installed...');

const electronPath = path.join(__dirname, 'node_modules', 'electron');
const distPath = path.join(electronPath, 'dist');

if (!fs.existsSync(distPath)) {
  console.log('📦 Electron binaries not found, downloading...');
  
  try {
    // Method 1: Try running electron install script
    const installScript = path.join(electronPath, 'install.js');
    if (fs.existsSync(installScript)) {
      execSync(`node "${installScript}"`, { stdio: 'inherit' });
    }
    
    // Method 2: If still not working, try reinstalling
    if (!fs.existsSync(distPath)) {
      console.log('🔄 Reinstalling Electron...');
      execSync('npm uninstall electron', { stdio: 'inherit' });
      execSync('npm install electron@latest --save-dev', { stdio: 'inherit' });
    }
    
    console.log('✅ Electron installation fixed!');
  } catch (error) {
    console.error('❌ Failed to fix Electron installation:', error.message);
    console.log('');
    console.log('Manual fix instructions:');
    console.log('1. Delete node_modules folder');
    console.log('2. Run: npm cache clean --force');
    console.log('3. Run: npm install');
    console.log('4. Run: node node_modules/electron/install.js');
  }
} else {
  console.log('✅ Electron is properly installed');
}