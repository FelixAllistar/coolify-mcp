import { 
  listDeployments,
  getDeploymentByUuid,
  deployByTagOrUuid,
  listDeploymentsByAppUuid
} from '../../generated/index.js';
import { safeApiCall } from '../../core/api-wrapper.js';

interface DeploymentsToolArgs {
  operation: string;
  id?: string;
  applicationUuid?: string;
  query?: string;
}

export async function deploymentsHandler(args: DeploymentsToolArgs) {
  const { operation, id, applicationUuid, query } = args;
  
  switch (operation) {
    case 'list':
      return await safeApiCall(() => listDeployments());
      
    case 'get':
      if (!id) throw new Error('ID required for get operation');
      return await safeApiCall(() => getDeploymentByUuid({ path: { uuid: id } }));
      
    case 'deploy':
      return await safeApiCall(() => deployByTagOrUuid({ query: query ? JSON.parse(query) : {} }));
      
    case 'list_by_app':
      if (!applicationUuid) throw new Error('applicationUuid required for list_by_app operation');
      return await safeApiCall(() => listDeploymentsByAppUuid({ path: { uuid: applicationUuid } } as any));
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const deploymentsTool = {
  name: "deployments_tool",
  description: "Manage application deployments and deployment history",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform",
        enum: ["list", "get", "deploy", "list_by_app"]
      },
      id: { type: "string", description: "Deployment UUID" },
      applicationUuid: { type: "string", description: "Application UUID (for list_by_app operation)" },
      query: { type: "string", description: "JSON query parameters for deploy operation" }
    },
    required: ["operation"]
  },
  handler: deploymentsHandler
}; 