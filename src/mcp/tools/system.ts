import {
  version,
  healthcheck,
  enableApi,
  disableApi,
  listResources
} from '../../generated/index.js';
import { safeApiCall } from '../../core/api-wrapper.js';

interface SystemToolArgs {
  operation: string;
}

export async function systemHandler(args: SystemToolArgs) {
  const { operation } = args;
  
  switch (operation) {
    case 'version':
      return await safeApiCall(() => version());
      
    case 'health':
      return await safeApiCall(() => healthcheck());
      
    case 'enable_api':
      return await safeApiCall(() => enableApi());
      
    case 'disable_api':
      return await safeApiCall(() => disableApi());
      
    case 'resources':
      return await safeApiCall(() => listResources());
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const systemTool = {
  name: "system_tool",
  description: "Access system-wide operations, health checks, and API management",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform",
        enum: ["version", "health", "enable_api", "disable_api", "resources"]
      }
    },
    required: ["operation"]
  },
  handler: systemHandler
}; 