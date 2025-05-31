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
    'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env'
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
  'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env'
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