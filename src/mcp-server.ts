#!/usr/bin/env node

// MCP Server Entry Point for Coolify API
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { z } from 'zod';

// Import core configuration
import { configureCoolifyClient } from './core/coolify-client.js';

// Import tool handlers
import { applicationsToolSchema, applicationsHandler } from './mcp/tools/applications.js';
import { databasesToolSchema, databasesHandler } from './mcp/tools/databases.js';
import { servicesHandler } from './mcp/tools/services.js';
import { projectsHandler } from './mcp/tools/projects.js';
import { serversHandler } from './mcp/tools/servers.js';
import { deploymentsHandler } from './mcp/tools/deployments.js';
import { privateKeysHandler } from './mcp/tools/private-keys.js';
import { systemHandler } from './mcp/tools/system.js';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Create MCP server instance
    const server = new McpServer({
      name: 'coolify-mcp',
      version: '1.0.0'
    });

    // Try to configure the Coolify client - show helpful error if missing config
    try {
      configureCoolifyClient();
      console.error('✓ Coolify client configured successfully');
    } catch (error) {
      console.error('❌ Coolify client configuration failed:', error instanceof Error ? error.message : String(error));
      console.error('');
      console.error('Please ensure the following environment variables are set:');
      console.error('  COOLIFY_API_URL - Your Coolify instance URL (e.g., https://coolify.example.com)');
      console.error('  COOLIFY_API_TOKEN - Your Coolify API token');
      console.error('');
      console.error('You can create a .env file in the project root or set these in your MCP configuration.');
      console.error('See .env.example for reference.');
      
      // Add a tool that explains the configuration issue
      server.tool(
        'config-status',
        {},
        async () => ({
          content: [{ 
            type: 'text', 
            text: 'Coolify MCP server is running but not configured. Please set COOLIFY_API_URL and COOLIFY_API_TOKEN environment variables to enable Coolify API access.' 
          }]
        })
      );
    }

    // Register applications tool with proper Zod schema format
    server.tool(
      'applications',
      {
        operation: z.enum([
          'list', 'get', 'create_public', 'create_private_gh', 'create_private_key',
          'create_dockerfile', 'create_docker_image', 'create_docker_compose',
          'update', 'delete', 'get_logs', 'start', 'stop', 'restart',
          'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Application UUID"),
        env_id: z.string().optional().describe("Environment variable ID"),
        body: z.string().optional().describe("JSON request body")
      },
      async ({ operation, id, env_id, body }) => {
        try {
          console.error('Applications tool received args:', JSON.stringify({ operation, id, env_id, body }, null, 2));
          
          const result = await applicationsHandler({ 
            operation, 
            id, 
            env_id, 
            body 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register databases tool with proper Zod schema format
    server.tool(
      'databases',
      {
        operation: z.enum([
          'list', 'get', 'update', 'delete', 'create_postgresql', 'create_clickhouse', 
          'create_dragonfly', 'create_redis', 'create_keydb', 'create_mariadb', 
          'create_mysql', 'create_mongodb', 'start', 'stop', 'restart'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Database UUID"),
        body: z.string().optional().describe("JSON request body")
      },
      async ({ operation, id, body }) => {
        try {
          console.error('Databases tool received args:', JSON.stringify({ operation, id, body }, null, 2));
          
          const result = await databasesHandler({ 
            operation, 
            id, 
            body 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register services tool with proper Zod schema format
    server.tool(
      'services',
      {
        operation: z.enum([
          'list', 'get', 'create', 'update', 'delete', 'start', 'stop', 'restart',
          'list_envs', 'create_env', 'update_env', 'update_envs_bulk', 'delete_env',
          'get_service_types'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Service UUID"),
        env_id: z.string().optional().describe("Environment variable UUID"),
        body: z.string().optional().describe("JSON request body")
      },
      async ({ operation, id, env_id, body }) => {
        try {
          console.error('Services tool received args:', JSON.stringify({ operation, id, env_id, body }, null, 2));
          
          const result = await servicesHandler({ 
            operation, 
            id, 
            env_id, 
            body 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register projects tool with proper Zod schema format
    server.tool(
      'projects',
      {
        operation: z.enum([
          'list', 'get', 'create', 'update', 'delete', 'environment', 'resources'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Project UUID"),
        environmentNameOrUuid: z.string().optional().describe("Environment name or UUID (for environment operation)"),
        body: z.string().optional().describe("JSON request body")
      },
      async ({ operation, id, environmentNameOrUuid, body }) => {
        try {
          console.error('Projects tool received args:', JSON.stringify({ operation, id, environmentNameOrUuid, body }, null, 2));
          
          const result = await projectsHandler({ 
            operation, 
            id, 
            environmentNameOrUuid, 
            body 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register servers tool with proper Zod schema format
    server.tool(
      'servers',
      {
        operation: z.enum([
          'list', 'get', 'create', 'update', 'delete', 'validate', 
          'resources', 'domains'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Server UUID"),
        body: z.string().optional().describe("JSON request body")
      },
      async ({ operation, id, body }) => {
        try {
          console.error('Servers tool received args:', JSON.stringify({ operation, id, body }, null, 2));
          
          const result = await serversHandler({ 
            operation, 
            id, 
            body 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register deployments tool with proper Zod schema format
    server.tool(
      'deployments',
      {
        operation: z.enum([
          'list', 'get', 'deploy', 'list_by_app'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Deployment UUID"),
        applicationUuid: z.string().optional().describe("Application UUID (for list_by_app operation)"),
        query: z.string().optional().describe("JSON query parameters for deploy operation")
      },
      async ({ operation, id, applicationUuid, query }) => {
        try {
          console.error('Deployments tool received args:', JSON.stringify({ operation, id, applicationUuid, query }, null, 2));
          
          const result = await deploymentsHandler({ 
            operation, 
            id, 
            applicationUuid, 
            query 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register private-keys tool with proper Zod schema format
    server.tool(
      'private-keys',
      {
        operation: z.enum([
          'list', 'get', 'create', 'update', 'delete'
        ]).describe("Operation to perform"),
        id: z.string().optional().describe("Private Key UUID"),
        body: z.string().optional().describe("JSON request body")
      },
      async ({ operation, id, body }) => {
        try {
          console.error('Private-keys tool received args:', JSON.stringify({ operation, id, body }, null, 2));
          
          const result = await privateKeysHandler({ 
            operation, 
            id, 
            body 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Register system tool with proper Zod schema format
    server.tool(
      'system',
      {
        operation: z.enum([
          'version', 'health', 'enable_api', 'disable_api', 'resources'
        ]).describe("Operation to perform")
      },
      async ({ operation }) => {
        try {
          console.error('System tool received args:', JSON.stringify({ operation }, null, 2));
          
          const result = await systemHandler({ 
            operation 
          });
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }],
            isError: true
          };
        }
      }
    );

    // Add a simple test tool to verify the server is working
    server.tool(
      'ping',
      {
        random_string: z.string().optional().describe("Dummy parameter for no-parameter tools")
      },
      async () => ({
        content: [{ 
          type: 'text', 
          text: 'Coolify MCP server is running and connected!' 
        }]
      })
    );

    // Set up stdio transport for communication
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    console.error('Coolify MCP server started successfully');
  } catch (error) {
    console.error('Failed to start Coolify MCP server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 