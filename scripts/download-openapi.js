#!/usr/bin/env node

/**
 * Download the latest OpenAPI specification from Coolify's GitHub repository
 * This ensures we always have the most up-to-date API specification
 */

import fs from 'fs';
import https from 'https';

const OPENAPI_URL = 'https://raw.githubusercontent.com/coollabsio/coolify-docs/refs/heads/v4.x/docs/.vitepress/theme/openapi.json';
const LOCAL_FILE = 'coolify-openapi.json';

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading OpenAPI spec from: ${url}`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Successfully downloaded OpenAPI spec to ${destination}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function validateOpenApiSpec(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const spec = JSON.parse(content);
    
    if (!spec.openapi) {
      throw new Error('Invalid OpenAPI spec: missing openapi version');
    }
    
    if (!spec.paths) {
      throw new Error('Invalid OpenAPI spec: missing paths');
    }
    
    console.log(`✅ OpenAPI spec validation passed`);
    console.log(`   Version: ${spec.openapi}`);
    console.log(`   Title: ${spec.info?.title || 'Unknown'}`);
    console.log(`   API Version: ${spec.info?.version || 'Unknown'}`);
    console.log(`   Endpoints: ${Object.keys(spec.paths).length}`);
    
    return spec;
  } catch (error) {
    throw new Error(`OpenAPI spec validation failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting OpenAPI spec download...\n');
  
  try {
    // Backup existing file if it exists
    if (fs.existsSync(LOCAL_FILE)) {
      const backupFile = `${LOCAL_FILE}.backup`;
      fs.copyFileSync(LOCAL_FILE, backupFile);
      console.log(`📦 Backed up existing spec to ${backupFile}`);
    }
    
    // Download the latest spec
    await downloadFile(OPENAPI_URL, LOCAL_FILE);
    
    // Validate the downloaded spec
    validateOpenApiSpec(LOCAL_FILE);
    
    console.log('\n🎉 OpenAPI spec download complete!');
    console.log('   You can now run "pnpm run generate" to update generated types');
    
  } catch (error) {
    console.error('❌ Error downloading OpenAPI spec:', error.message);
    
    // Restore backup if it exists
    const backupFile = `${LOCAL_FILE}.backup`;
    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, LOCAL_FILE);
      console.log('🔄 Restored previous OpenAPI spec from backup');
    }
    
    process.exit(1);
  }
}

main(); 