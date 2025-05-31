import { 
  listProjects,
  createProject,
  deleteProjectByUuid,
  getProjectByUuid,
  updateProjectByUuid,
  getEnvironmentByNameOrUuid,
  listResources
} from '../../generated/index.js';
import { safeApiCall } from '../../core/api-wrapper.js';

interface ProjectsToolArgs {
  operation: string;
  id?: string;
  environmentNameOrUuid?: string;
  body?: string;
}

export async function projectsHandler(args: ProjectsToolArgs) {
  const { operation, id, environmentNameOrUuid, body } = args;
  
  switch (operation) {
    case 'list':
      return await safeApiCall(() => listProjects());
      
    case 'get':
      if (!id) throw new Error('ID required for get operation');
      return await safeApiCall(() => getProjectByUuid({ path: { uuid: id } }));
      
    case 'create':
      if (!body) throw new Error('Body required for create operation');
      const createData = JSON.parse(body);
      return await safeApiCall(() => createProject({ body: createData }));
      
    case 'update':
      if (!id || !body) throw new Error('ID and body required for update operation');
      const updateData = JSON.parse(body);
      return await safeApiCall(() => updateProjectByUuid({ 
        path: { uuid: id }, 
        body: updateData 
      } as any));
      
    case 'delete':
      if (!id) throw new Error('ID required for delete operation');
      return await safeApiCall(() => deleteProjectByUuid({ path: { uuid: id } }));
      
    case 'environment':
      if (!id || !environmentNameOrUuid) throw new Error('ID and environmentNameOrUuid required for environment operation');
      return await safeApiCall(() => getEnvironmentByNameOrUuid({ 
        path: { 
          uuid: id, 
          environment_name_or_uuid: environmentNameOrUuid 
        } 
      }));
      
    case 'resources':
      return await safeApiCall(() => listResources());
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const projectsTool = {
  name: "projects_tool",
  description: "Manage projects that group applications, databases, and services",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform",
        enum: ["list", "get", "create", "update", "delete", "environment", "resources"]
      },
      id: { type: "string", description: "Project UUID" },
      environmentNameOrUuid: { type: "string", description: "Environment name or UUID (for environment operation)" },
      body: { type: "string", description: "JSON request body" }
    },
    required: ["operation"]
  },
  handler: projectsHandler
}; 