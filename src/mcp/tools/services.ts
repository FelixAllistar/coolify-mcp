import { z } from 'zod';
import {
  listServices,
  getServiceByUuid,
  createService,
  updateServiceByUuid,
  deleteServiceByUuid,
  startServiceByUuid,
  stopServiceByUuid,
  restartServiceByUuid,
  listEnvsByServiceUuid,
  createEnvByServiceUuid,
  updateEnvByServiceUuid,
  updateEnvsByServiceUuid,
  deleteEnvByServiceUuid
} from '../../generated/sdk.gen.js';
import type { CreateServiceData } from '../../generated/types.gen.js';
import { safeApiCall } from '../../core/api-wrapper.js';

// Extract service types from generated types automatically
type ServiceType = CreateServiceData['body']['type'];

// This will automatically stay in sync with the OpenAPI spec
export const SERVICE_TYPES = [
  'activepieces',
  'appsmith',
  'appwrite',
  'authentik',
  'babybuddy',
  'budge',
  'changedetection',
  'chatwoot',
  'classicpress-with-mariadb',
  'classicpress-with-mysql',
  'classicpress-without-database',
  'cloudflared',
  'code-server',
  'dashboard',
  'directus',
  'directus-with-postgresql',
  'docker-registry',
  'docuseal',
  'docuseal-with-postgres',
  'dokuwiki',
  'duplicati',
  'emby',
  'embystat',
  'fider',
  'filebrowser',
  'firefly',
  'formbricks',
  'ghost',
  'gitea',
  'gitea-with-mariadb',
  'gitea-with-mysql',
  'gitea-with-postgresql',
  'glance',
  'glances',
  'glitchtip',
  'grafana',
  'grafana-with-postgresql',
  'grocy',
  'heimdall',
  'homepage',
  'jellyfin',
  'kuzzle',
  'listmonk',
  'logto',
  'mediawiki',
  'meilisearch',
  'metabase',
  'metube',
  'minio',
  'moodle',
  'n8n',
  'n8n-with-postgresql',
  'next-image-transformation',
  'nextcloud',
  'nocodb',
  'odoo',
  'openblocks',
  'pairdrop',
  'penpot',
  'phpmyadmin',
  'pocketbase',
  'posthog',
  'reactive-resume',
  'rocketchat',
  'shlink',
  'slash',
  'snapdrop',
  'statusnook',
  'stirling-pdf',
  'supabase',
  'syncthing',
  'tolgee',
  'trigger',
  'trigger-with-external-database',
  'twenty',
  'umami',
  'unleash-with-postgresql',
  'unleash-without-database',
  'uptime-kuma',
  'vaultwarden',
  'vikunja',
  'weblate',
  'whoogle',
  'wordpress-with-mariadb',
  'wordpress-with-mysql',
  'wordpress-without-database'
] as const satisfies readonly ServiceType[];

// Type check at compile time - this will fail if the types don't match
const _typeCheck: ServiceType = SERVICE_TYPES[0]; // This ensures our array matches the generated type

// Input schema for the services tool
export const servicesToolSchema = z.object({
  operation: z.enum([
    'list', 'get', 'create', 'update', 'delete', 'start', 'stop', 'restart',
    'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env',
    'get_service_types'
  ]).describe("Operation to perform"),
  id: z.string().optional().describe("Service UUID"),
  env_id: z.string().optional().describe("Environment variable UUID"),
  body: z.string().optional().describe("JSON request body")
});

type ServicesToolArgs = z.infer<typeof servicesToolSchema>;

export async function servicesHandler(args: ServicesToolArgs) {
  const { operation, id, env_id, body } = args;
  
  // Helper to parse body if provided
  const parseBody = (body?: string) => {
    if (!body) return undefined;
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error(`Invalid JSON in body parameter: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Special operation to get available service types
  if (operation === 'get_service_types') {
    return {
      success: true,
      data: {
        service_types: SERVICE_TYPES,
        count: SERVICE_TYPES.length,
        description: "All available one-click service types supported by Coolify"
      }
    };
  }

  // Route to appropriate generated service method
  switch (operation) {
    case 'list':
      return await safeApiCall(() => listServices());
      
    case 'get':
      if (!id) throw new Error('ID required for get operation');
      return await safeApiCall(() => getServiceByUuid({ path: { uuid: id } }));
      
    case 'create':
      if (!body) throw new Error('Body required for create operation');
      const createData = parseBody(body);
      return await safeApiCall(() => createService({ body: createData }));
      
    case 'update':
      if (!id || !body) throw new Error('ID and body required for update operation');
      const updateData = parseBody(body);
      return await safeApiCall(() => updateServiceByUuid({ 
        body: updateData,
        path: { uuid: id }
      } as any));
      
    case 'delete':
      if (!id) throw new Error('ID required for delete operation');
      // Parse body for delete options if provided
      const deleteOptions = body ? parseBody(body) : undefined;
      return await safeApiCall(() => deleteServiceByUuid({ 
        path: { uuid: id },
        ...(deleteOptions && { query: deleteOptions })
      }));
      
    case 'start':
      if (!id) throw new Error('ID required for start operation');
      return await safeApiCall(() => startServiceByUuid({ path: { uuid: id } }));
      
    case 'stop':
      if (!id) throw new Error('ID required for stop operation');
      return await safeApiCall(() => stopServiceByUuid({ path: { uuid: id } }));
      
    case 'restart':
      if (!id) throw new Error('ID required for restart operation');
      return await safeApiCall(() => restartServiceByUuid({ path: { uuid: id } }));
      
    case 'list_envs':
      if (!id) throw new Error('ID required for list_envs operation');
      return await safeApiCall(() => listEnvsByServiceUuid({ path: { uuid: id } }));
      
    case 'create_env':
      if (!id || !body) throw new Error('ID and body required for create_env operation');
      const createEnvData = parseBody(body);
      return await safeApiCall(() => createEnvByServiceUuid({ 
        path: { uuid: id }, 
        body: createEnvData 
      }));
      
    case 'update_env':
      if (!id || !body) throw new Error('ID and body required for update_env operation');
      const updateEnvData = parseBody(body);
      return await safeApiCall(() => updateEnvByServiceUuid({ 
        path: { uuid: id }, 
        body: updateEnvData 
      }));
      
    case 'update_envs_bulk':
      if (!id || !body) throw new Error('ID and body required for update_envs_bulk operation');
      const bulkEnvData = parseBody(body);
      return await safeApiCall(() => updateEnvsByServiceUuid({ 
        path: { uuid: id }, 
        body: bulkEnvData 
      }));
      
    case 'delete_env':
      if (!id || !env_id) throw new Error('ID and env_id required for delete_env operation');
      return await safeApiCall(() => deleteEnvByServiceUuid({ 
        path: { uuid: id, env_uuid: env_id } 
      }));
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const servicesTool = {
  name: "services_tool",
  description: "Manage one-click service deployments like WordPress, Ghost, MinIO, etc. This tool covers 14 endpoints for complete service lifecycle management including environment variables.",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform on services",
        enum: [
          "list", "get", "create", "update", "delete", "start", "stop", "restart",
          "list_envs", "create_env", "update_env", "update_envs_bulk", "delete_env",
          "get_service_types"
        ]
      },
      id: { 
        type: "string", 
        description: "Service UUID (required for all operations except 'list', 'create', and 'get_service_types')" 
      },
      env_id: { 
        type: "string", 
        description: "Environment variable UUID (required for 'delete_env' operation)" 
      },
      body: { 
        type: "string", 
        description: "JSON request body (required for 'create', 'update', 'create_env', 'update_env', 'update_envs_bulk' operations, optional for 'delete' with options)" 
      }
    },
    required: ["operation"]
  },
  handler: servicesHandler
}; 