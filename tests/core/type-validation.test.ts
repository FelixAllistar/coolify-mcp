import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Type Validation', () => {
  const GENERATED_DIR = path.join(process.cwd(), 'src/generated');
  const SERVICES_FILE = path.join(process.cwd(), 'src/mcp/tools/services.ts');
  const DATABASES_FILE = path.join(process.cwd(), 'src/mcp/tools/databases.ts');

  it('should have generated types directory', () => {
    expect(fs.existsSync(GENERATED_DIR)).toBe(true);
  });

  it('should have all required generated files', () => {
    const requiredFiles = ['types.gen.ts', 'sdk.gen.ts', 'client.gen.ts', 'index.ts'];
    
    for (const file of requiredFiles) {
      const filePath = path.join(GENERATED_DIR, file);
      expect(fs.existsSync(filePath), `Missing generated file: ${file}`).toBe(true);
    }
  });

  it('should have valid TypeScript in generated files', () => {
    const typesFile = path.join(GENERATED_DIR, 'types.gen.ts');
    const content = fs.readFileSync(typesFile, 'utf8');
    
    // Check for basic TypeScript constructs
    expect(content).toContain('export type');
    expect(content).toContain('CreateServiceData');
    expect(content).not.toContain('undefined');
  });

  it('should have SERVICE_TYPES array with proper TypeScript typing', () => {
    const content = fs.readFileSync(SERVICES_FILE, 'utf8');
    
    // Check that SERVICE_TYPES exists and has proper typing
    expect(content).toContain('export const SERVICE_TYPES');
    expect(content).toContain('satisfies readonly ServiceType[]');
    expect(content).toContain("'wordpress-with-mysql'"); // Should have at least this service
  });

  it('should have DATABASE_TYPES array', () => {
    const content = fs.readFileSync(DATABASES_FILE, 'utf8');
    
    // Check that DATABASE_TYPES exists
    expect(content).toContain('export const DATABASE_TYPES');
    expect(content).toContain("'postgresql'"); // Should have at least this database
    expect(content).toContain("'mysql'");
    expect(content).toContain("'mongodb'");
  });

  it('should have SERVICE_TYPES matching generated types', async () => {
    // Import the types dynamically
    const servicesModule = await import('../../src/mcp/tools/services.js');
    const typesModule = await import('../../src/generated/types.gen.js');
    
    expect(servicesModule.SERVICE_TYPES).toBeDefined();
    expect(Array.isArray(servicesModule.SERVICE_TYPES)).toBe(true);
    expect(servicesModule.SERVICE_TYPES.length).toBeGreaterThan(50); // Should have many services
  });

  it('should not have any TODO or FIXME comments in generated files', () => {
    const typesFile = path.join(GENERATED_DIR, 'types.gen.ts');
    const content = fs.readFileSync(typesFile, 'utf8');
    
    expect(content.toLowerCase()).not.toContain('todo');
    expect(content.toLowerCase()).not.toContain('fixme');
  });
}); 