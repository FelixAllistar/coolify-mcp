import { describe, it, expect, vi } from 'vitest';

// Mock the API calls to avoid hitting real Coolify instances
vi.mock('../../src/core/api-wrapper.js', () => ({
  safeApiCall: vi.fn()
}));

vi.mock('../../src/generated/sdk.gen.js', () => ({
  listApplications: vi.fn(),
  listDatabases: vi.fn(),
  listServices: vi.fn(),
  listProjects: vi.fn(),
  healthcheck: vi.fn()
}));

describe('MCP Tool Handlers', () => {
  it('should import tool handlers without errors', async () => {
    const { applicationsHandler } = await import('../../src/mcp/tools/applications.js');
    const { databasesHandler } = await import('../../src/mcp/tools/databases.js');
    const { servicesHandler } = await import('../../src/mcp/tools/services.js');
    
    expect(applicationsHandler).toBeDefined();
    expect(typeof applicationsHandler).toBe('function');
    expect(databasesHandler).toBeDefined();
    expect(typeof databasesHandler).toBe('function');
    expect(servicesHandler).toBeDefined();
    expect(typeof servicesHandler).toBe('function');
  });

  it('should handle services get_service_types operation', async () => {
    const { servicesHandler } = await import('../../src/mcp/tools/services.js');
    
    const result = await servicesHandler({
      operation: 'get_service_types'
    });
    
    // Check that result has the expected structure
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data');
    expect((result as any).data).toHaveProperty('service_types');
    expect(Array.isArray((result as any).data.service_types)).toBe(true);
    expect((result as any).data.service_types.length).toBeGreaterThan(70);
    expect((result as any).data.service_types).toContain('wordpress-with-mysql');
  });

  it('should handle databases get_database_types operation', async () => {
    const { databasesHandler } = await import('../../src/mcp/tools/databases.js');
    
    const result = await databasesHandler({
      operation: 'get_database_types'
    });
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data');
    expect((result as any).data).toHaveProperty('database_types');
    expect(Array.isArray((result as any).data.database_types)).toBe(true);
    expect((result as any).data.database_types).toContain('postgresql');
    expect((result as any).data.database_types).toContain('mysql');
    expect((result as any).data.database_types).toContain('mongodb');
  });

  it('should handle system health operation', async () => {
    const { systemHandler } = await import('../../src/mcp/tools/system.js');
    const { safeApiCall } = await import('../../src/core/api-wrapper.js');
    (safeApiCall as any).mockResolvedValueOnce({ data: { status: 'ok' } });
    
    const result = await systemHandler({
      operation: 'health'
    });
    
    expect(result).toHaveProperty('data');
  });

  it('should handle applications list operation with mocked API', async () => {
    const { safeApiCall } = await import('../../src/core/api-wrapper.js');
    (safeApiCall as any).mockResolvedValueOnce({ data: [] });
    
    const { applicationsHandler } = await import('../../src/mcp/tools/applications.js');
    
    const result = await applicationsHandler({
      operation: 'list'
    });
    
    // Should return whatever safeApiCall returns
    expect(result).toHaveProperty('data');
  });

  it('should handle invalid operations gracefully', async () => {
    const { applicationsHandler } = await import('../../src/mcp/tools/applications.js');
    
    await expect(async () => {
      await applicationsHandler({
        operation: 'invalid_operation' as any
      });
    }).rejects.toThrow();
  });

  it('should require ID for operations that need it', async () => {
    const { applicationsHandler } = await import('../../src/mcp/tools/applications.js');
    
    await expect(async () => {
      await applicationsHandler({
        operation: 'get'
        // Missing required id parameter
      });
    }).rejects.toThrow(/required/);
  });

  it('should validate JSON in body parameter', async () => {
    const { applicationsHandler } = await import('../../src/mcp/tools/applications.js');
    
    await expect(async () => {
      await applicationsHandler({
        operation: 'create_public',
        body: 'invalid json'
      });
    }).rejects.toThrow(/Invalid JSON/);
  });

  it('should validate required operations parameter exists', async () => {
    const { applicationsHandler } = await import('../../src/mcp/tools/applications.js');
    
    // TypeScript should catch this, but test runtime behavior
    await expect(async () => {
      await applicationsHandler({} as any);
    }).rejects.toThrow();
  });

  it('should have SERVICE_TYPES constant exported', async () => {
    const servicesModule = await import('../../src/mcp/tools/services.js');
    
    expect(servicesModule.SERVICE_TYPES).toBeDefined();
    expect(Array.isArray(servicesModule.SERVICE_TYPES)).toBe(true);
    expect(servicesModule.SERVICE_TYPES.length).toBeGreaterThan(80);
  });

  it('should have DATABASE_TYPES constant exported', async () => {
    const databasesModule = await import('../../src/mcp/tools/databases.js');
    
    expect(databasesModule.DATABASE_TYPES).toBeDefined();
    expect(Array.isArray(databasesModule.DATABASE_TYPES)).toBe(true);
    expect(databasesModule.DATABASE_TYPES.length).toBeGreaterThan(5);
  });
}); 