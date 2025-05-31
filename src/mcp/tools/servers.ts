import { 
  listServers,
  createServer,
  deleteServerByUuid,
  getServerByUuid,
  updateServerByUuid,
  getResourcesByServerUuid,
  validateServerByUuid,
  getDomainsByServerUuid
} from '../../generated/index.js';
import { safeApiCall } from '../../core/api-wrapper.js';

interface ServersToolArgs {
  operation: string;
  id?: string;
  body?: string;
}

export async function serversHandler(args: ServersToolArgs) {
  const { operation, id, body } = args;
  
  switch (operation) {
    case 'list':
      return await safeApiCall(() => listServers());
      
    case 'get':
      if (!id) throw new Error('ID required for get operation');
      return await safeApiCall(() => getServerByUuid({ path: { uuid: id } }));
      
    case 'create':
      if (!body) throw new Error('Body required for create operation');
      const createData = JSON.parse(body);
      return await safeApiCall(() => createServer({ body: createData }));
      
    case 'update':
      if (!id || !body) throw new Error('ID and body required for update operation');
      const updateData = JSON.parse(body);
      return await safeApiCall(() => updateServerByUuid({ 
        path: { uuid: id }, 
        body: updateData 
      } as any));
      
    case 'delete':
      if (!id) throw new Error('ID required for delete operation');
      return await safeApiCall(() => deleteServerByUuid({ path: { uuid: id } }));
      
    case 'validate':
      if (!id) throw new Error('ID required for validate operation');
      return await safeApiCall(() => validateServerByUuid({ path: { uuid: id } }));
      
    case 'resources':
      if (!id) throw new Error('ID required for resources operation');
      return await safeApiCall(() => getResourcesByServerUuid({ path: { uuid: id } }));
      
    case 'domains':
      if (!id) throw new Error('ID required for domains operation');
      return await safeApiCall(() => getDomainsByServerUuid({ path: { uuid: id } }));
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const serversTool = {
  name: "servers_tool",
  description: "Manage server connections, validate connectivity, and monitor resources",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform",
        enum: ["list", "get", "create", "update", "delete", "validate", 
               "resources", "domains"]
      },
      id: { type: "string", description: "Server UUID" },
      body: { type: "string", description: "JSON request body" }
    },
    required: ["operation"]
  },
  handler: serversHandler
}; 