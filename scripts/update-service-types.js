#!/usr/bin/env node

/**
 * Extract service types and database types from generated OpenAPI types and update corresponding files
 * This ensures both SERVICE_TYPES and DATABASE_TYPES arrays stay in sync with Coolify's API
 */

import fs from 'fs';
import path from 'path';

const TYPES_FILE = 'src/generated/types.gen.ts';
const SERVICES_FILE = 'src/mcp/tools/services.ts';
const DATABASES_FILE = 'src/mcp/tools/databases.ts';
const OPENAPI_FILE = 'coolify-openapi.json';

function extractServiceTypes() {
  console.log('📋 Extracting service types from OpenAPI spec...');
  
  // Read the OpenAPI spec to find service types
  const openApiContent = fs.readFileSync(OPENAPI_FILE, 'utf8');
  const openApiSpec = JSON.parse(openApiContent);
  
  const serviceTypes = openApiSpec.paths['/services'].post.requestBody.content['application/json'].schema.properties.type.enum;
  
  if (!serviceTypes) {
    console.error('❌ Could not find service types in OpenAPI spec');
    process.exit(1);
  }
  
  console.log(`✅ Found ${serviceTypes.length} service types`);
  return serviceTypes.sort();
}

function extractDatabaseTypes() {
  console.log('📋 Extracting database types from OpenAPI spec...');
  
  // Read the OpenAPI spec to find database endpoints
  const openApiContent = fs.readFileSync(OPENAPI_FILE, 'utf8');
  const openApiSpec = JSON.parse(openApiContent);
  
  // Extract database types from endpoint paths
  const databaseTypes = [];
  
  for (const path in openApiSpec.paths) {
    const match = path.match(/^\/databases\/([^\/]+)$/);
    if (match && match[1] !== '{uuid}') {
      databaseTypes.push(match[1]);
    }
  }
  
  // Remove duplicates and sort
  const uniqueDatabaseTypes = [...new Set(databaseTypes)].sort();
  
  console.log(`✅ Found ${uniqueDatabaseTypes.length} database types: ${uniqueDatabaseTypes.join(', ')}`);
  return uniqueDatabaseTypes;
}

function updateServicesFile(serviceTypes) {
  console.log('🔄 Updating services.ts file...');
  
  const servicesContent = fs.readFileSync(SERVICES_FILE, 'utf8');
  
  // Create the new SERVICE_TYPES array
  const serviceTypesArray = serviceTypes.map(type => `  '${type}'`).join(',\n');
  const newArray = `export const SERVICE_TYPES = [\n${serviceTypesArray}\n] as const satisfies readonly ServiceType[];`;
  
  // Replace the existing SERVICE_TYPES declaration
  const updatedContent = servicesContent.replace(
    /export const SERVICE_TYPES = \[[\s\S]*?\] as const satisfies readonly ServiceType\[\];/,
    newArray
  );
  
  if (updatedContent === servicesContent) {
    console.log('⚠️  No changes needed - SERVICE_TYPES array is already up to date');
    return false;
  }
  
  fs.writeFileSync(SERVICES_FILE, updatedContent);
  console.log('✅ Successfully updated SERVICE_TYPES array');
  return true;
}

function updateDatabasesFile(databaseTypes) {
  console.log('🔄 Updating databases.ts file...');
  
  if (!fs.existsSync(DATABASES_FILE)) {
    console.log('⚠️  databases.ts file not found - skipping database types update');
    return false;
  }
  
  const databasesContent = fs.readFileSync(DATABASES_FILE, 'utf8');
  
  // Create the new DATABASE_TYPES array
  const databaseTypesArray = databaseTypes.map(type => `  '${type}'`).join(',\n');
  const newArray = `export const DATABASE_TYPES = [\n${databaseTypesArray}\n] as const;`;
  
  // Check if DATABASE_TYPES already exists and replace it
  const databaseTypesRegex = /export const DATABASE_TYPES = \[[\s\S]*?\] as const;/;
  let updatedContent;
  
  if (databaseTypesRegex.test(databasesContent)) {
    updatedContent = databasesContent.replace(databaseTypesRegex, newArray);
  } else {
    // If DATABASE_TYPES doesn't exist, add it after imports
    const importEndIndex = databasesContent.lastIndexOf("from '");
    const afterImports = databasesContent.indexOf('\n', importEndIndex);
    
    if (afterImports !== -1) {
      updatedContent = databasesContent.slice(0, afterImports + 1) + 
                      '\n// Database types extracted from OpenAPI spec\n' +
                      newArray + '\n' +
                      databasesContent.slice(afterImports + 1);
    } else {
      console.log('⚠️  Could not find appropriate location to add DATABASE_TYPES');
      return false;
    }
  }
  
  if (updatedContent === databasesContent) {
    console.log('⚠️  No changes needed - DATABASE_TYPES array is already up to date');
    return false;
  }
  
  fs.writeFileSync(DATABASES_FILE, updatedContent);
  console.log('✅ Successfully updated DATABASE_TYPES array');
  return true;
}

function main() {
  console.log('🚀 Starting service and database types update...\n');
  
  // Check if files exist
  if (!fs.existsSync(TYPES_FILE)) {
    console.error(`❌ Generated types file not found: ${TYPES_FILE}`);
    console.error('   Run "pnpm run generate" first to generate types from OpenAPI spec');
    process.exit(1);
  }
  
  if (!fs.existsSync(OPENAPI_FILE)) {
    console.error(`❌ OpenAPI spec file not found: ${OPENAPI_FILE}`);
    console.error('   Run "pnpm run download-openapi" first to download the latest spec');
    process.exit(1);
  }
  
  if (!fs.existsSync(SERVICES_FILE)) {
    console.error(`❌ Services file not found: ${SERVICES_FILE}`);
    process.exit(1);
  }
  
  try {
    // Extract and update service types
    const serviceTypes = extractServiceTypes();
    const servicesUpdated = updateServicesFile(serviceTypes);
    
    // Extract and update database types
    const databaseTypes = extractDatabaseTypes();
    const databasesUpdated = updateDatabasesFile(databaseTypes);
    
    console.log('\n🎉 Types update complete!');
    if (servicesUpdated) {
      console.log('   ✅ SERVICE_TYPES array has been updated');
    }
    if (databasesUpdated) {
      console.log('   ✅ DATABASE_TYPES array has been updated');
    }
    console.log(`   📊 Total service types: ${serviceTypes.length}`);
    console.log(`   📊 Total database types: ${databaseTypes.length}`);
    
  } catch (error) {
    console.error('❌ Error updating types:', error.message);
    process.exit(1);
  }
}

main(); 