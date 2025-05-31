import { Command } from 'commander';
import chalk from 'chalk';
import { serversHandler } from '../../mcp/tools/servers.js';

export function registerServersCommands(program: Command) {
  const servers = program.command('servers')
    .description('Manage server connections, validate connectivity, and monitor resources');
  
  // List servers
  servers.command('list')
    .description('List all servers')
    .action(async () => {
      try {
        const result = await serversHandler({ operation: 'list' });
        console.log(chalk.green('Servers:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((server: any) => ({
            id: server.uuid,
            name: server.name,
            ip: server.ip,
            status: server.status,
            port: server.port || 22,
            user: server.user || 'root',
            created: server.created_at ? new Date(server.created_at).toLocaleDateString() : 'N/A'
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get server details
  servers.command('get <id>')
    .description('Get server details')
    .action(async (id) => {
      try {
        const result = await serversHandler({ operation: 'get', id });
        console.log(chalk.green('Server Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create server
  servers.command('create')
    .description('Create a new server connection')
    .requiredOption('--name <name>', 'Server name')
    .requiredOption('--ip <ip>', 'Server IP address')
    .option('--port <port>', 'SSH port', '22')
    .option('--user <user>', 'SSH username', 'root')
    .option('--private-key-id <keyId>', 'Private key ID for SSH authentication')
    .option('--description <description>', 'Server description')
    .action(async (options) => {
      try {
        const serverData: any = {
          name: options.name,
          ip: options.ip,
          port: parseInt(options.port),
          user: options.user
        };

        if (options.privateKeyId) serverData.private_key_id = options.privateKeyId;
        if (options.description) serverData.description = options.description;

        const body = JSON.stringify(serverData);
        
        const result = await serversHandler({ 
          operation: 'create', 
          body 
        });
        
        console.log(chalk.green('Server created successfully:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Update server
  servers.command('update <id>')
    .description('Update a server')
    .option('--name <name>', 'Server name')
    .option('--description <description>', 'Server description')
    .option('--ip <ip>', 'Server IP address')
    .option('--port <port>', 'SSH port')
    .option('--user <user>', 'SSH username')
    .option('--private-key-id <keyId>', 'Private key ID for SSH authentication')
    .action(async (id, options) => {
      try {
        const updateData: any = {};
        if (options.name) updateData.name = options.name;
        if (options.description) updateData.description = options.description;
        if (options.ip) updateData.ip = options.ip;
        if (options.port) updateData.port = parseInt(options.port);
        if (options.user) updateData.user = options.user;
        if (options.privateKeyId) updateData.private_key_id = options.privateKeyId;

        const body = JSON.stringify(updateData);
        
        const result = await serversHandler({ 
          operation: 'update', 
          id,
          body 
        });
        
        console.log(chalk.green('Server updated successfully:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Delete server
  servers.command('delete <id>')
    .description('Delete a server')
    .option('--force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete server ${id}?`,
              default: false
            }
          ]);
          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled.'));
            return;
          }
        }

        await serversHandler({ 
          operation: 'delete', 
          id 
        });
        
        console.log(chalk.green(`Server ${id} deleted successfully.`));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Validate server connection
  servers.command('validate <id>')
    .description('Validate server connectivity and SSH access')
    .action(async (id) => {
      try {
        console.log(chalk.blue(`Validating server connection ${id}...`));
        const result = await serversHandler({ operation: 'validate', id });
        console.log(chalk.green(`Server ${id} validation completed:`));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Validation failed:'), error.message);
        process.exit(1);
      }
    });

  // Get server resources
  servers.command('resources <id>')
    .description('Get server resource usage and statistics')
    .action(async (id) => {
      try {
        const result = await serversHandler({ operation: 'resources', id });
        console.log(chalk.green(`Resources for server ${id}:`));
        
        if (result.data) {
          const resources = result.data as any;
          
          // Display in a formatted way if it's resource data
          if (resources.cpu || resources.memory || resources.disk) {
            console.log(chalk.blue('\n📊 Server Resources:'));
            if (resources.cpu) console.log(`  CPU: ${resources.cpu}%`);
            if (resources.memory) console.log(`  Memory: ${resources.memory}%`);
            if (resources.disk) console.log(`  Disk: ${resources.disk}%`);
            if (resources.load) console.log(`  Load: ${resources.load}`);
            if (resources.uptime) console.log(`  Uptime: ${resources.uptime}`);
          } else {
            console.log(JSON.stringify(result.data, null, 2));
          }
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Get server domains
  servers.command('domains <id>')
    .description('List all domains hosted on this server')
    .action(async (id) => {
      try {
        const result = await serversHandler({ operation: 'domains', id });
        console.log(chalk.green(`Domains on server ${id}:`));
        
        if (Array.isArray(result.data)) {
          if (result.data.length === 0) {
            console.log(chalk.yellow('No domains found on this server.'));
          } else {
            console.table(result.data.map((domain: any) => ({
              domain: domain.domain || domain.name,
              type: domain.type || 'Unknown',
              status: domain.status || 'Unknown',
              application: domain.application?.name || 'N/A',
              service: domain.service?.name || 'N/A'
            })));
          }
        } else {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
} 