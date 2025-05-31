#!/usr/bin/env node

/**
 * Prepare for release by ensuring all types are up to date and tests pass
 */

import { execSync } from 'child_process';
import fs from 'fs';

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`📦 Current version: ${packageJson.version}`);
  console.log(`📦 Package name: ${packageJson.name}`);
}

async function main() {
  console.log('🚀 Preparing release for Coolify MCP...\n');
  
  checkVersion();
  
  // Check for API updates
  console.log('\n🔍 Checking for OpenAPI spec updates...');
  try {
    execSync('pnpm run check-updates', { stdio: 'pipe' });
    console.log('✅ OpenAPI spec is up to date');
  } catch (error) {
    console.log('⚠️  OpenAPI spec updates available, refreshing...');
    runCommand('pnpm run refresh', 'Updating OpenAPI spec and regenerating types');
  }
  
  // Run full test suite
  runCommand('pnpm test', 'Running test suite');
  
  // Test build
  runCommand('pnpm run build', 'Building project');
  
  // Test CLI
  runCommand('node dist/cli/index.js --help', 'Testing CLI functionality');
  
  console.log('\n🎉 Release preparation complete!');
  console.log('\nNext steps:');
  console.log('1. Update version: pnpm version patch|minor|major');
  console.log('2. Push changes: git push && git push --tags');
  console.log('3. Create GitHub release to trigger NPM publish');
  console.log('4. Or publish manually: npm publish --access public');
}

main().catch(error => {
  console.error('❌ Release preparation failed:', error);
  process.exit(1);
}); 