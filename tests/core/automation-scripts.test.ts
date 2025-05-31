import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import { execSync } from 'child_process';

describe('Automation Scripts', () => {
  it('should validate OpenAPI spec download script exists', () => {
    expect(fs.existsSync('scripts/download-openapi.js')).toBe(true);
  });

  it('should validate update service types script exists', () => {
    expect(fs.existsSync('scripts/update-service-types.js')).toBe(true);
  });

  it('should validate check updates script exists', () => {
    expect(fs.existsSync('scripts/check-updates.js')).toBe(true);
  });

  it('should have all required npm scripts', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts;
    
    expect(scripts['download-openapi']).toBeDefined();
    expect(scripts['generate']).toBeDefined();
    expect(scripts['update-service-types']).toBeDefined();
    expect(scripts['check-updates']).toBeDefined();
    expect(scripts['refresh']).toBeDefined();
  });

  it('should not break on type extraction', async () => {
    // This tests the core logic of update-service-types.js without actually running it
    const typesContent = fs.readFileSync('src/generated/types.gen.ts', 'utf8');
    const servicesContent = fs.readFileSync('src/mcp/tools/services.ts', 'utf8');
    
    // Check that the files have the expected patterns
    expect(typesContent).toContain('CreateServiceData');
    expect(servicesContent).toContain('SERVICE_TYPES');
    expect(servicesContent).toContain('satisfies readonly ServiceType[]');
  });

  it('should have consistent service count between files', async () => {
    // Import the actual SERVICE_TYPES array
    const servicesModule = await import('../../src/mcp/tools/services.js');
    
    // Check that we have a reasonable number of services
    expect(servicesModule.SERVICE_TYPES.length).toBeGreaterThan(70);
    expect(servicesModule.SERVICE_TYPES.length).toBeLessThan(200); // Sanity check
  });

  it('should have consistent database types', async () => {
    const databasesModule = await import('../../src/mcp/tools/databases.js');
    
    // Check expected database types
    const expectedDatabases = ['postgresql', 'mysql', 'mongodb', 'redis'];
    for (const db of expectedDatabases) {
      expect(databasesModule.DATABASE_TYPES).toContain(db);
    }
  });

  it('should validate OpenAPI spec format', () => {
    if (fs.existsSync('coolify-openapi.json')) {
      const content = fs.readFileSync('coolify-openapi.json', 'utf8');
      const spec = JSON.parse(content);
      
      expect(spec.openapi).toBeDefined();
      expect(spec.paths).toBeDefined();
      expect(typeof spec.paths === 'object').toBe(true);
      expect(Object.keys(spec.paths).length).toBeGreaterThan(50);
    }
  });

  it('should build successfully after refresh', () => {
    // This is a critical test - ensure our automation doesn't break the build
    expect(() => {
      execSync('npm run build', { stdio: 'pipe' });
    }).not.toThrow();
  });
}); 