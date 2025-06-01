import { z } from 'zod';
import {
  listApplications,
  getApplicationByUuid,
  createPublicApplication,
  createPrivateGithubAppApplication,
  createPrivateDeployKeyApplication,
  createDockerfileApplication,
  createDockerimageApplication,
  createDockercomposeApplication,
  updateApplicationByUuid,
  deleteApplicationByUuid,
  getApplicationLogsByUuid,
  startApplicationByUuid,
  stopApplicationByUuid,
  restartApplicationByUuid,
  listEnvsByApplicationUuid,
  createEnvByApplicationUuid,
  updateEnvByApplicationUuid,
  updateEnvsByApplicationUuid,
  deleteEnvByApplicationUuid
} from '../../generated/sdk.gen.js';
import { safeApiCall } from '../../core/api-wrapper.js';
import {
  validateRequiredParams,
  parseJsonBody,
  validateCoolifyId,
  validateOperation,
  CoolifyError
} from '../../core/error-handler.js';

// Input schema for the applications tool
export const applicationsToolSchema = z.object({
  operation: z.enum([
    'list', 'get', 'create_public', 'create_private_gh', 'create_private_key',
    'create_dockerfile', 'create_docker_image', 'create_docker_compose', 
    'update', 'delete', 'get_logs', 'start', 'stop', 'restart',
    'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env',
    'execute_command'
  ]).describe("Operation to perform"),
  id: z.string().optional().describe("Application UUID"),
  env_id: z.string().optional().describe("Environment variable ID"),
  body: z.string().optional().describe("JSON request body")
});

export type ApplicationsToolArgs = z.infer<typeof applicationsToolSchema>;

// Define allowed operations for validation
const ALLOWED_OPERATIONS: string[] = [
  'list', 'get', 'create_public', 'create_private_gh', 'create_private_key',
  'create_dockerfile', 'create_docker_image', 'create_docker_compose', 
  'update', 'delete', 'get_logs', 'start', 'stop', 'restart',
  'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env',
  'execute_command'
];

export async function applicationsHandler(args: ApplicationsToolArgs) {
  try {
    const { operation, id, env_id, body } = args;
    
    // Validate operation
    validateOperation(operation, ALLOWED_OPERATIONS);
    
    // Route to appropriate generated service method with proper validation
    switch (operation) {
      case 'list':
        return await safeApiCall(() => listApplications());
        
      case 'get':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => getApplicationByUuid({ path: { uuid: id! } }));
        
      case 'create_public':
        validateRequiredParams({ body }, ['body']);
        const createPublicData = parseJsonBody(body);
        return await safeApiCall(() => createPublicApplication({ body: createPublicData }));
        
      case 'create_private_gh':
        validateRequiredParams({ body }, ['body']);
        const createPrivateGhData = parseJsonBody(body);
        return await safeApiCall(() => createPrivateGithubAppApplication({ body: createPrivateGhData }));
        
      case 'create_private_key':
        validateRequiredParams({ body }, ['body']);
        const createPrivateKeyData = parseJsonBody(body);
        return await safeApiCall(() => createPrivateDeployKeyApplication({ body: createPrivateKeyData }));
        
      case 'create_dockerfile':
        validateRequiredParams({ body }, ['body']);
        const createDockerfileData = parseJsonBody(body);
        return await safeApiCall(() => createDockerfileApplication({ body: createDockerfileData }));
        
      case 'create_docker_image':
        validateRequiredParams({ body }, ['body']);
        const createDockerImageData = parseJsonBody(body);
        return await safeApiCall(() => createDockerimageApplication({ body: createDockerImageData }));
        
      case 'create_docker_compose':
        validateRequiredParams({ body }, ['body']);
        const createDockerComposeData = parseJsonBody(body);
        return await safeApiCall(() => createDockercomposeApplication({ body: createDockerComposeData }));
        
      case 'update':
        validateRequiredParams({ id, body }, ['id', 'body']);
        validateCoolifyId(id!, 'id');
        const updateData = parseJsonBody(body);
        return await safeApiCall(() => updateApplicationByUuid({ 
          path: { uuid: id! },
          body: updateData 
        } as any));
        
      case 'delete':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => deleteApplicationByUuid({ path: { uuid: id! } }));
        
      case 'get_logs':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => getApplicationLogsByUuid({ path: { uuid: id! } }));
        
      case 'start':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => startApplicationByUuid({ path: { uuid: id! } }));
        
      case 'stop':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => stopApplicationByUuid({ path: { uuid: id! } }));
        
      case 'restart':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => restartApplicationByUuid({ path: { uuid: id! } }));
        
      case 'list_envs':
        validateRequiredParams({ id }, ['id']);
        validateCoolifyId(id!, 'id');
        return await safeApiCall(() => listEnvsByApplicationUuid({ path: { uuid: id! } }));
        
      case 'create_env':
        validateRequiredParams({ id, body }, ['id', 'body']);
        validateCoolifyId(id!, 'id');
        const createEnvData = parseJsonBody(body);
        return await safeApiCall(() => createEnvByApplicationUuid({ 
          path: { uuid: id! }, 
          body: createEnvData 
        }));
        
      case 'update_env':
        validateRequiredParams({ id, env_id, body }, ['id', 'env_id', 'body']);
        validateCoolifyId(id!, 'id');
        validateCoolifyId(env_id!, 'env_id');
        const updateEnvData = parseJsonBody(body);
        return await safeApiCall(() => updateEnvByApplicationUuid({ 
          path: { uuid: id! },
          body: updateEnvData 
        }));
        
      case 'update_envs_bulk':
        validateRequiredParams({ id, body }, ['id', 'body']);
        validateCoolifyId(id!, 'id');
        const updateEnvsBulkData = parseJsonBody(body);
        return await safeApiCall(() => updateEnvsByApplicationUuid({ 
          path: { uuid: id! }, 
          body: updateEnvsBulkData 
        }));
        
      case 'delete_env':
        validateRequiredParams({ id, env_id }, ['id', 'env_id']);
        validateCoolifyId(id!, 'id');
        validateCoolifyId(env_id!, 'env_id');
        return await safeApiCall(() => deleteEnvByApplicationUuid({ 
          path: { uuid: id!, env_uuid: env_id! } 
        }));
        
      case 'execute_command':
        validateRequiredParams({ id, body }, ['id', 'body']);
        validateCoolifyId(id!, 'id');
        const commandData = parseJsonBody(body);
        
        if (!commandData.command) {
          throw new CoolifyError('Command is required in request body');
        }
        
        // Try the undocumented execute endpoint
        try {
          // Since this endpoint isn't in the generated SDK, we'll make a direct fetch call
          const response = await fetch(`${process.env.COOLIFY_API_URL}/api/v1/applications/${id}/execute`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ command: commandData.command })
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new CoolifyError(
                `Execute command endpoint not available in this Coolify version or application not found. ` +
                `This feature may not be supported in your Coolify instance.`,
                404
              );
            }
            
            const errorText = await response.text();
            throw new CoolifyError(
              `API request failed: ${response.status} ${response.statusText}. ${errorText}`,
              response.status
            );
          }
          
          const result = await response.json();
          return { data: result };
          
        } catch (error) {
          if (error instanceof CoolifyError) {
            throw error;
          }
          
          // Handle network errors or other fetch errors
          throw new CoolifyError(
            `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
            500,
            { command: commandData.command, applicationId: id }
          );
        }
        
      default:
        // This should never be reached due to validateOperation above
        throw new CoolifyError(`Unhandled operation: ${operation}`);
    }
  } catch (error) {
    // Re-throw CoolifyError instances as-is, wrap others
    if (error instanceof CoolifyError) {
      throw error;
    }
    throw new CoolifyError(
      `Applications tool error: ${error instanceof Error ? error.message : String(error)}`,
      500,
      { operation: args.operation, originalError: error }
    );
  }
} 