import { Command } from 'commander';
import chalk from 'chalk';
import { servicesHandler, SERVICE_TYPES } from '../../mcp/tools/services.js';

export function registerServicesCommands(program: Command) {
  const services = program.command('services')
    .description('Manage one-click services (WordPress, Ghost, MinIO, etc.)');
  
  // List services
  services.command('list')
    .description('List all services')
    .action(async () => {
      try {
        const result = await servicesHandler({ operation: 'list' });
        console.log(chalk.green('Services:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((service: any) => ({
            id: service.uuid,
            name: service.name,
            type: service.type,
            status: service.status,
            project: service.project?.name || 'N/A',
            created: service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get service details
  services.command('get <id>')
    .description('Get service details')
    .action(async (id) => {
      try {
        const result = await servicesHandler({ operation: 'get', id });
        console.log(chalk.green('Service Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Get available service types
  services.command('types')
    .description('List all available one-click service types')
    .action(async () => {
      try {
        const result = await servicesHandler({ operation: 'get_service_types' });
        console.log(chalk.green('Available Service Types:'));
        console.log(chalk.blue(`Total: ${(result.data as any).count} service types\n`));
        
        // Group services by category for better readability
        const categories = {
          'CMS & Blogging': SERVICE_TYPES.filter(type => 
            ['wordpress-with-mariadb', 'wordpress-with-mysql', 'wordpress-without-database', 
             'ghost', 'classicpress-with-mariadb', 'classicpress-with-mysql', 
             'classicpress-without-database', 'mediawiki'].includes(type)
          ),
          'Development & Tools': SERVICE_TYPES.filter(type => 
            ['gitea', 'gitea-with-mariadb', 'gitea-with-mysql', 'gitea-with-postgresql',
             'code-server', 'docker-registry', 'n8n', 'n8n-with-postgresql'].includes(type)
          ),
          'Productivity & Business': SERVICE_TYPES.filter(type => 
            ['appsmith', 'directus', 'directus-with-postgresql', 'formbricks', 
             'nocodb', 'pocketbase', 'twenty', 'odoo'].includes(type)
          ),
          'Media & Entertainment': SERVICE_TYPES.filter(type => 
            ['jellyfin', 'emby', 'embystat', 'metube'].includes(type)
          ),
          'Monitoring & Analytics': SERVICE_TYPES.filter(type => 
            ['grafana', 'grafana-with-postgresql', 'uptime-kuma', 'glances', 
             'umami', 'posthog', 'statusnook'].includes(type)
          ),
          'Communication': SERVICE_TYPES.filter(type => 
            ['chatwoot', 'rocketchat', 'authentik'].includes(type)
          ),
          'File Management': SERVICE_TYPES.filter(type => 
            ['filebrowser', 'nextcloud', 'minio', 'syncthing', 'duplicati'].includes(type)
          ),
          'Other': SERVICE_TYPES.filter(type => 
            !['wordpress-with-mariadb', 'wordpress-with-mysql', 'wordpress-without-database',
              'ghost', 'classicpress-with-mariadb', 'classicpress-with-mysql', 
              'classicpress-without-database', 'mediawiki', 'gitea', 'gitea-with-mariadb', 
              'gitea-with-mysql', 'gitea-with-postgresql', 'code-server', 'docker-registry', 
              'n8n', 'n8n-with-postgresql', 'appsmith', 'directus', 'directus-with-postgresql', 
              'formbricks', 'nocodb', 'pocketbase', 'twenty', 'odoo', 'jellyfin', 'emby', 
              'embystat', 'metube', 'grafana', 'grafana-with-postgresql', 'uptime-kuma', 
              'glances', 'umami', 'posthog', 'statusnook', 'chatwoot', 'rocketchat', 
              'authentik', 'filebrowser', 'nextcloud', 'minio', 'syncthing', 'duplicati'].includes(type)
          )
        };

        Object.entries(categories).forEach(([category, types]) => {
          if (types.length > 0) {
            console.log(chalk.yellow(`\n${category}:`));
            types.forEach(type => console.log(`  • ${type}`));
          }
        });

        console.log(chalk.cyan('\nUse these types with the "create" command.'));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create service
  services.command('create')
    .description('Create a new one-click service')
    .requiredOption('--name <name>', 'Service name')
    .requiredOption('--type <type>', 'Service type (use "services types" to see available options)')
    .requiredOption('--project <projectId>', 'Project ID where the service will be deployed')
    .option('--description <description>', 'Service description')
    .option('--environment <env>', 'Environment variables as JSON object')
    .option('--domains <domains>', 'Comma-separated list of domains')
    .action(async (options) => {
      try {
        // Validate service type
        if (!SERVICE_TYPES.includes(options.type as any)) {
          console.error(chalk.red(`Invalid service type: ${options.type}`));
          console.log(chalk.yellow('Use "services types" to see available options'));
          process.exit(1);
        }

        const serviceData: any = {
          name: options.name,
          type: options.type,
          project_uuid: options.project
        };

        if (options.description) serviceData.description = options.description;
        if (options.environment) serviceData.environment = JSON.parse(options.environment);
        if (options.domains) serviceData.domains = options.domains.split(',').map((d: string) => d.trim());

        const body = JSON.stringify(serviceData);
        
        const result = await servicesHandler({ 
          operation: 'create', 
          body 
        });
        
        console.log(chalk.green('Service created successfully:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Update service
  services.command('update <id>')
    .description('Update a service')
    .option('--name <name>', 'Service name')
    .option('--description <description>', 'Service description')
    .option('--environment <env>', 'Environment variables as JSON object')
    .option('--domains <domains>', 'Comma-separated list of domains')
    .action(async (id, options) => {
      try {
        const updateData: any = {};
        if (options.name) updateData.name = options.name;
        if (options.description) updateData.description = options.description;
        if (options.environment) updateData.environment = JSON.parse(options.environment);
        if (options.domains) updateData.domains = options.domains.split(',').map((d: string) => d.trim());

        const body = JSON.stringify(updateData);
        
        const result = await servicesHandler({ 
          operation: 'update', 
          id,
          body 
        });
        
        console.log(chalk.green('Service updated successfully:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Delete service
  services.command('delete <id>')
    .description('Delete a service')
    .option('--force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete service ${id}?`,
              default: false
            }
          ]);
          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled.'));
            return;
          }
        }

        await servicesHandler({ 
          operation: 'delete', 
          id 
        });
        
        console.log(chalk.green(`Service ${id} deleted successfully.`));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Service control operations
  services.command('start <id>')
    .description('Start a service')
    .action(async (id) => {
      try {
        const result = await servicesHandler({ operation: 'start', id });
        console.log(chalk.green(`Service ${id} started successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  services.command('stop <id>')
    .description('Stop a service')
    .action(async (id) => {
      try {
        const result = await servicesHandler({ operation: 'stop', id });
        console.log(chalk.green(`Service ${id} stopped successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  services.command('restart <id>')
    .description('Restart a service')
    .action(async (id) => {
      try {
        const result = await servicesHandler({ operation: 'restart', id });
        console.log(chalk.green(`Service ${id} restarted successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Environment variables management
  const envs = services.command('envs')
    .description('Manage service environment variables');

  envs.command('list <id>')
    .description('List environment variables for a service')
    .action(async (id) => {
      try {
        const result = await servicesHandler({ operation: 'list_envs', id });
        console.log(chalk.green(`Environment variables for service ${id}:`));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((env: any) => ({
            id: env.id,
            key: env.key,
            value: env.value?.substring(0, 50) + (env.value?.length > 50 ? '...' : ''),
            is_secret: env.is_secret || false
          })));
        } else {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  envs.command('create <id>')
    .description('Create environment variable for a service')
    .requiredOption('--key <key>', 'Environment variable key')
    .requiredOption('--value <value>', 'Environment variable value')
    .option('--is-secret', 'Mark as secret variable')
    .action(async (id, options) => {
      try {
        const body = JSON.stringify({
          key: options.key,
          value: options.value,
          is_secret: options.isSecret || false
        });
        
        const result = await servicesHandler({ 
          operation: 'create_env', 
          id,
          body 
        });
        
        console.log(chalk.green('Environment variable created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  envs.command('update <id>')
    .description('Update environment variable for a service')
    .option('--key <key>', 'Environment variable key')
    .option('--value <value>', 'Environment variable value')
    .option('--is-secret', 'Mark as secret variable')
    .action(async (id, options) => {
      try {
        const updateData: any = {};
        if (options.key) updateData.key = options.key;
        if (options.value) updateData.value = options.value;
        if (options.isSecret !== undefined) updateData.is_secret = options.isSecret;

        const body = JSON.stringify(updateData);
        
        const result = await servicesHandler({ 
          operation: 'update_env', 
          id,
          body 
        });
        
        console.log(chalk.green('Environment variable updated:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  envs.command('update-bulk <id>')
    .description('Update multiple environment variables for a service')
    .requiredOption('--env-vars <envVars>', 'Environment variables as JSON array')
    .action(async (id, options) => {
      try {
        const envVars = JSON.parse(options.envVars);
        const body = JSON.stringify({ environment_variables: envVars });
        
        const result = await servicesHandler({ 
          operation: 'update_envs_bulk', 
          id,
          body 
        });
        
        console.log(chalk.green('Environment variables updated in bulk:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  envs.command('delete <id>')
    .description('Delete environment variable from a service')
    .requiredOption('--env-id <envId>', 'Environment variable ID')
    .option('--force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete environment variable ${options.envId}?`,
              default: false
            }
          ]);
          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled.'));
            return;
          }
        }

        await servicesHandler({ 
          operation: 'delete_env', 
          id,
          env_id: options.envId
        });
        
        console.log(chalk.green(`Environment variable ${options.envId} deleted successfully.`));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
} 