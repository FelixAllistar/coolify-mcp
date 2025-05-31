#!/usr/bin/env node

/**
 * Check if the local OpenAPI spec is up to date with the remote version
 * Useful for CI/CD or scheduled checks
 */

import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

const OPENAPI_URL = 'https://raw.githubusercontent.com/coollabsio/coolify-docs/refs/heads/v4.x/docs/.vitepress/theme/openapi.json';
const LOCAL_FILE = 'coolify-openapi.json';

function getRemoteSpec(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch remote spec: HTTP ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const spec = JSON.parse(data);
          resolve(spec);
        } catch (error) {
          reject(new Error(`Invalid JSON from remote: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

function getLocalSpec(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid local spec: ${error.message}`);
  }
}

function getSpecHash(spec) {
  const content = JSON.stringify(spec, null, 2);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function compareSpecs(local, remote) {
  if (!local) {
    return {
      needsUpdate: true,
      reason: 'No local OpenAPI spec found'
    };
  }
  
  const localHash = getSpecHash(local);
  const remoteHash = getSpecHash(remote);
  
  if (localHash === remoteHash) {
    return {
      needsUpdate: false,
      reason: 'OpenAPI spec is up to date'
    };
  }
  
  // Check for differences
  const differences = [];
  
  if (local.info?.version !== remote.info?.version) {
    differences.push(`API version: ${local.info?.version} → ${remote.info?.version}`);
  }
  
  const localPaths = Object.keys(local.paths || {}).length;
  const remotePaths = Object.keys(remote.paths || {}).length;
  
  if (localPaths !== remotePaths) {
    differences.push(`Endpoints: ${localPaths} → ${remotePaths}`);
  }
  
  return {
    needsUpdate: true,
    reason: differences.length > 0 ? `Changes detected: ${differences.join(', ')}` : 'Content differences detected',
    differences
  };
}

async function main() {
  console.log('🔍 Checking for OpenAPI spec updates...\n');
  
  try {
    console.log('📥 Fetching remote OpenAPI spec...');
    const remoteSpec = await getRemoteSpec(OPENAPI_URL);
    
    console.log('📄 Reading local OpenAPI spec...');
    const localSpec = getLocalSpec(LOCAL_FILE);
    
    const comparison = compareSpecs(localSpec, remoteSpec);
    
    if (comparison.needsUpdate) {
      console.log('⚠️  Update available!');
      console.log(`   Reason: ${comparison.reason}`);
      
      if (comparison.differences) {
        console.log('   Changes:');
        comparison.differences.forEach(diff => console.log(`     • ${diff}`));
      }
      
      console.log('\n💡 Run the following commands to update:');
      console.log('   pnpm run refresh');
      
      // Exit with code 1 to indicate update is needed (useful for CI)
      process.exit(1);
      
    } else {
      console.log('✅ OpenAPI spec is up to date!');
      console.log(`   ${comparison.reason}`);
      
      if (localSpec) {
        console.log(`   Version: ${localSpec.info?.version || 'Unknown'}`);
        console.log(`   Endpoints: ${Object.keys(localSpec.paths || {}).length}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking for updates:', error.message);
    process.exit(1);
  }
}

main(); 