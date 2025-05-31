import {
  listPrivateKeys,
  updatePrivateKey,
  createPrivateKey,
  deletePrivateKeyByUuid,
  getPrivateKeyByUuid
} from '../../generated/index.js';
import { safeApiCall } from '../../core/api-wrapper.js';

interface PrivateKeysToolArgs {
  operation: string;
  id?: string;
  body?: string;
}

export async function privateKeysHandler(args: PrivateKeysToolArgs) {
  const { operation, id, body } = args;
  
  switch (operation) {
    case 'list':
      return await safeApiCall(() => listPrivateKeys());
      
    case 'get':
      if (!id) throw new Error('ID required for get operation');
      return await safeApiCall(() => getPrivateKeyByUuid({ path: { uuid: id } }));
      
    case 'create':
      if (!body) throw new Error('Body required for create operation');
      const createData = JSON.parse(body);
      return await safeApiCall(() => createPrivateKey({ body: createData }));
      
    case 'update':
      if (!id || !body) throw new Error('ID and body required for update operation');
      const updateData = JSON.parse(body);
      return await safeApiCall(() => updatePrivateKey({ 
        path: { uuid: id }, 
        body: updateData 
      } as any));
      
    case 'delete':
      if (!id) throw new Error('ID required for delete operation');
      return await safeApiCall(() => deletePrivateKeyByUuid({ path: { uuid: id } }));
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const privateKeysTool = {
  name: "private_keys_tool",
  description: "Manage SSH private keys for repository access",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform",
        enum: ["list", "get", "create", "update", "delete"]
      },
      id: { type: "string", description: "Private Key UUID" },
      body: { type: "string", description: "JSON request body" }
    },
    required: ["operation"]
  },
  handler: privateKeysHandler
}; 