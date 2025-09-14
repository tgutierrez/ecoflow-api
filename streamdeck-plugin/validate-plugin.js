#!/usr/bin/env node

/**
 * Simple validation script for StreamDeck plugin structure
 */

const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = './com.tomas-g.eco-power-deck.sdPlugin';
const REQUIRED_FILES = [
  'manifest.json',
  'bin/plugin.js',
  'imgs/actions/eco-power/key-consuming.png',
  'imgs/actions/eco-power/key-generating.png',
  'imgs/actions/eco-power/icon.png',
  'imgs/plugin/category-icon.png',
  'ui/eco-power-inspector.html'
];

console.log('🔍 Validating StreamDeck plugin structure...\n');

let allValid = true;

// Check if plugin directory exists
if (!fs.existsSync(PLUGIN_DIR)) {
  console.error(`❌ Plugin directory ${PLUGIN_DIR} does not exist`);
  allValid = false;
} else {
  console.log(`✅ Plugin directory exists: ${PLUGIN_DIR}`);
}

// Check required files
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(PLUGIN_DIR, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.error(`❌ Missing required file: ${file}`);
    allValid = false;
  }
});

// Validate manifest.json
try {
  const manifestPath = path.join(PLUGIN_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log('\n📋 Manifest validation:');
    console.log(`   UUID: ${manifest.UUID}`);
    console.log(`   Name: ${manifest.Name}`);
    console.log(`   Version: ${manifest.Version}`);
    console.log(`   Author: ${manifest.Author}`);
    console.log(`   Actions: ${manifest.Actions.length}`);
    
    if (manifest.Actions.length > 0) {
      const action = manifest.Actions[0];
      console.log(`   Action UUID: ${action.UUID}`);
      console.log(`   Action Name: ${action.Name}`);
      console.log(`   States: ${action.States ? action.States.length : 0}`);
    }
  }
} catch (error) {
  console.error(`❌ Error parsing manifest.json: ${error.message}`);
  allValid = false;
}

// Check if plugin.js is valid JavaScript
try {
  const pluginPath = path.join(PLUGIN_DIR, 'bin/plugin.js');
  if (fs.existsSync(pluginPath)) {
    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    if (pluginContent.includes('streamDeck') && pluginContent.includes('EcoPowerAction')) {
      console.log('✅ plugin.js contains expected content');
    } else {
      console.warn('⚠️  plugin.js may be missing expected content');
    }
  }
} catch (error) {
  console.error(`❌ Error validating plugin.js: ${error.message}`);
  allValid = false;
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ Plugin validation passed! Plugin should be ready for installation.');
  console.log('\nTo install:');
  console.log(`1. Zip the ${PLUGIN_DIR} folder`);
  console.log('2. Rename the zip file to .sdPlugin extension');
  console.log('3. Double-click to install in StreamDeck software');
} else {
  console.error('❌ Plugin validation failed! Please fix the issues above.');
  process.exit(1);
}