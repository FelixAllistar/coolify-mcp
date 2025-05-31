import { z } from 'zod';
import {
  listDatabases,
  getDatabaseByUuid,
  updateDatabaseByUuid,
  deleteDatabaseByUuid,
  createDatabasePostgresql,
  createDatabaseClickhouse,
  createDatabaseDragonfly,
  createDatabaseRedis,
  createDatabaseKeydb,
  createDatabaseMariadb,
  createDatabaseMysql,
  createDatabaseMongodb,
  startDatabaseByUuid,
  stopDatabaseByUuid,
  restartDatabaseByUuid
} from '../../generated/sdk.gen.js';
import { safeApiCall } from '../../core/api-wrapper.js';

// Database types extracted from OpenAPI spec
export const DATABASE_TYPES = [
  'clickhouse',
  'dragonfly',
  'keydb',
  'mariadb',
  'mongodb',
  'mysql',
  'postgresql',
  'redis'
] as const;

// Input schema for the databases tool
export const databasesToolSchema = z.object({
  operation: z.enum([
    'list', 'get', 'update', 'delete',
    'create_postgresql', 'create_clickhouse', 'create_dragonfly', 
    'create_redis', 'create_keydb', 'create_mariadb', 
    'create_mysql', 'create_mongodb',
    'start', 'stop', 'restart', 'get_database_types'
  ]).describe("Operation to perform"),
  id: z.string().optional().describe("Database UUID"),
  body: z.string().optional().describe("JSON request body")
});

export type DatabasesToolArgs = z.infer<typeof databasesToolSchema>;

export async function databasesHandler(args: DatabasesToolArgs) {
  const { operation, id, body } = args;
  
  // Helper to parse body if provided
  const parseBody = (body?: string) => {
    if (!body) return undefined;
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error(`Invalid JSON in body parameter: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Special operation to get available database types
  if (operation === 'get_database_types') {
    return {
      success: true,
      data: {
        database_types: DATABASE_TYPES,
        count: DATABASE_TYPES.length,
        description: "All available database types supported by Coolify"
      }
    };
  }

  // Route to appropriate generated service method
  switch (operation) {
    case 'list':
      return await safeApiCall(() => listDatabases());
      
    case 'get':
      if (!id) throw new Error('ID required for get operation');
      return await safeApiCall(() => getDatabaseByUuid({ path: { uuid: id } }));
      
    case 'update':
      if (!id || !body) throw new Error('ID and body required for update operation');
      const updateData = parseBody(body);
      return await safeApiCall(() => updateDatabaseByUuid({ 
        path: { uuid: id }, 
        body: updateData 
      }));
      
    case 'delete':
      if (!id) throw new Error('ID required for delete operation');
      return await safeApiCall(() => deleteDatabaseByUuid({ path: { uuid: id } }));
      
    case 'create_postgresql':
      if (!body) throw new Error('Body required for create_postgresql operation');
      const postgresqlData = parseBody(body);
      return await safeApiCall(() => createDatabasePostgresql({ body: postgresqlData }));
      
    case 'create_clickhouse':
      if (!body) throw new Error('Body required for create_clickhouse operation');
      const clickhouseData = parseBody(body);
      return await safeApiCall(() => createDatabaseClickhouse({ body: clickhouseData }));
      
    case 'create_dragonfly':
      if (!body) throw new Error('Body required for create_dragonfly operation');
      const dragonflyData = parseBody(body);
      return await safeApiCall(() => createDatabaseDragonfly({ body: dragonflyData }));
      
    case 'create_redis':
      if (!body) throw new Error('Body required for create_redis operation');
      const redisData = parseBody(body);
      return await safeApiCall(() => createDatabaseRedis({ body: redisData }));
      
    case 'create_keydb':
      if (!body) throw new Error('Body required for create_keydb operation');
      const keydbData = parseBody(body);
      return await safeApiCall(() => createDatabaseKeydb({ body: keydbData }));
      
    case 'create_mariadb':
      if (!body) throw new Error('Body required for create_mariadb operation');
      const mariadbData = parseBody(body);
      return await safeApiCall(() => createDatabaseMariadb({ body: mariadbData }));
      
    case 'create_mysql':
      if (!body) throw new Error('Body required for create_mysql operation');
      const mysqlData = parseBody(body);
      return await safeApiCall(() => createDatabaseMysql({ body: mysqlData }));
      
    case 'create_mongodb':
      if (!body) throw new Error('Body required for create_mongodb operation');
      const mongodbData = parseBody(body);
      return await safeApiCall(() => createDatabaseMongodb({ body: mongodbData }));
      
    case 'start':
      if (!id) throw new Error('ID required for start operation');
      return await safeApiCall(() => startDatabaseByUuid({ path: { uuid: id } }));
      
    case 'stop':
      if (!id) throw new Error('ID required for stop operation');
      return await safeApiCall(() => stopDatabaseByUuid({ path: { uuid: id } }));
      
    case 'restart':
      if (!id) throw new Error('ID required for restart operation');
      return await safeApiCall(() => restartDatabaseByUuid({ path: { uuid: id } }));
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const databasesTool = {
  name: "databases_tool",
  description: "Manage database deployments including PostgreSQL, MySQL, MongoDB, Redis, and more. This tool covers 13 database operations for complete database lifecycle management.",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform on databases",
        enum: [
          "list", "get", "update", "delete",
          "create_postgresql", "create_clickhouse", "create_dragonfly", 
          "create_redis", "create_keydb", "create_mariadb", 
          "create_mysql", "create_mongodb",
          "start", "stop", "restart", "get_database_types"
        ]
      },
      id: { 
        type: "string", 
        description: "Database UUID (required for all operations except 'list', 'create_*', and 'get_database_types')" 
      },
      body: { 
        type: "string", 
        description: "JSON request body (required for 'create_*' and 'update' operations)" 
      }
    },
    required: ["operation"]
  },
  handler: databasesHandler
}; 