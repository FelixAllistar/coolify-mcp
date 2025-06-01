import { Command } from 'commander';
import chalk from 'chalk';
import { applicationsHandler } from '../../mcp/tools/applications.js';

export function registerApplicationsCommands(program: Command) {
  const apps = program.command('apps')
    .description('Manage applications');
  
  // List applications
  apps.command('list')
    .description('List all applications')
    .action(async () => {
      try {
        const result = await applicationsHandler({ operation: 'list' });
        console.log(chalk.green('Applications:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((app: any) => ({
            id: app.uuid,
            name: app.name,
            status: app.status,
            type: app.type,
            repository: app.git_repository || 'N/A',
            branch: app.git_branch || 'N/A'
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get application details
  apps.command('get <id>')
    .description('Get application details')
    .action(async (id) => {
      try {
        const result = await applicationsHandler({ operation: 'get', id });
        console.log(chalk.green('Application Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create applications
  apps.command('create-public')
    .description('Create a new public application')
    .requiredOption('--name <name>', 'Application name')
    .requiredOption('--repository <repo>', 'Git repository URL')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--branch <branch>', 'Git branch', 'main')
    .option('--build-command <command>', 'Build command')
    .option('--start-command <command>', 'Start command')
    .option('--description <description>', 'Application description')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          repository: options.repository,
          projectUuid: options.project,
          branch: options.branch,
          ...(options.buildCommand && { build_command: options.buildCommand }),
          ...(options.startCommand && { start_command: options.startCommand }),
          ...(options.description && { description: options.description })
        });
        
        const result = await applicationsHandler({ 
          operation: 'create_public', 
          body 
        });
        
        console.log(chalk.green('Public application created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('create-private-github')
    .description('Create a new private GitHub application')
    .requiredOption('--name <name>', 'Application name')
    .requiredOption('--repository <repo>', 'Private Git repository URL')
    .requiredOption('--project <projectId>', 'Project ID')
    .requiredOption('--github-app-id <appId>', 'GitHub App ID')
    .requiredOption('--github-installation-id <installationId>', 'GitHub Installation ID')
    .option('--branch <branch>', 'Git branch', 'main')
    .option('--build-command <command>', 'Build command')
    .option('--start-command <command>', 'Start command')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          repository: options.repository,
          projectUuid: options.project,
          branch: options.branch,
          github_app_id: options.githubAppId,
          github_installation_id: options.githubInstallationId,
          ...(options.buildCommand && { build_command: options.buildCommand }),
          ...(options.startCommand && { start_command: options.startCommand })
        });
        
        const result = await applicationsHandler({ 
          operation: 'create_private_gh', 
          body 
        });
        
        console.log(chalk.green('Private GitHub application created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('create-private-key')
    .description('Create a new private application with deploy key')
    .requiredOption('--name <name>', 'Application name')
    .requiredOption('--repository <repo>', 'Private Git repository URL')
    .requiredOption('--project <projectId>', 'Project ID')
    .requiredOption('--private-key-id <keyId>', 'Private key ID for repository access')
    .option('--branch <branch>', 'Git branch', 'main')
    .option('--build-command <command>', 'Build command')
    .option('--start-command <command>', 'Start command')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          repository: options.repository,
          projectUuid: options.project,
          branch: options.branch,
          private_key_id: options.privateKeyId,
          ...(options.buildCommand && { build_command: options.buildCommand }),
          ...(options.startCommand && { start_command: options.startCommand })
        });
        
        const result = await applicationsHandler({ 
          operation: 'create_private_key', 
          body 
        });
        
        console.log(chalk.green('Private key application created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('create-dockerfile')
    .description('Create a new application from Dockerfile')
    .requiredOption('--name <name>', 'Application name')
    .requiredOption('--repository <repo>', 'Git repository URL')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--branch <branch>', 'Git branch', 'main')
    .option('--dockerfile-path <path>', 'Path to Dockerfile', 'Dockerfile')
    .option('--build-context <context>', 'Build context path', '.')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          repository: options.repository,
          projectUuid: options.project,
          branch: options.branch,
          dockerfile_path: options.dockerfilePath,
          build_context: options.buildContext
        });
        
        const result = await applicationsHandler({ 
          operation: 'create_dockerfile', 
          body 
        });
        
        console.log(chalk.green('Dockerfile application created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('create-docker-image')
    .description('Create a new application from Docker image')
    .requiredOption('--name <name>', 'Application name')
    .requiredOption('--image <image>', 'Docker image name with tag')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--registry-username <username>', 'Registry username')
    .option('--registry-password <password>', 'Registry password')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          docker_image: options.image,
          projectUuid: options.project,
          ...(options.registryUsername && { registry_username: options.registryUsername }),
          ...(options.registryPassword && { registry_password: options.registryPassword })
        });
        
        const result = await applicationsHandler({ 
          operation: 'create_docker_image', 
          body 
        });
        
        console.log(chalk.green('Docker image application created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('create-docker-compose')
    .description('Create a new application from Docker Compose')
    .requiredOption('--name <name>', 'Application name')
    .requiredOption('--repository <repo>', 'Git repository URL with docker-compose.yml')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--branch <branch>', 'Git branch', 'main')
    .option('--compose-file <file>', 'Docker compose file path', 'docker-compose.yml')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          repository: options.repository,
          projectUuid: options.project,
          branch: options.branch,
          docker_compose_file: options.composeFile
        });
        
        const result = await applicationsHandler({ 
          operation: 'create_docker_compose', 
          body 
        });
        
        console.log(chalk.green('Docker Compose application created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Update application
  apps.command('update <id>')
    .description('Update an application')
    .option('--name <name>', 'Application name')
    .option('--description <description>', 'Application description')
    .option('--build-command <command>', 'Build command')
    .option('--start-command <command>', 'Start command')
    .option('--install-command <command>', 'Install command')
    .option('--port <port>', 'Application port')
    .option('--env <env>', 'Environment variables (JSON string)')
    .action(async (id, options) => {
      try {
        const updateData: any = {};
        if (options.name) updateData.name = options.name;
        if (options.description) updateData.description = options.description;
        if (options.buildCommand) updateData.build_command = options.buildCommand;
        if (options.startCommand) updateData.start_command = options.startCommand;
        if (options.installCommand) updateData.install_command = options.installCommand;
        if (options.port) updateData.port = parseInt(options.port);
        if (options.env) updateData.environment = JSON.parse(options.env);

        const body = JSON.stringify(updateData);
        
        const result = await applicationsHandler({ 
          operation: 'update', 
          id,
          body 
        });
        
        console.log(chalk.green('Application updated:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Delete application
  apps.command('delete <id>')
    .description('Delete an application')
    .option('--force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete application ${id}?`,
              default: false
            }
          ]);
          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled.'));
            return;
          }
        }

        await applicationsHandler({ 
          operation: 'delete', 
          id 
        });
        
        console.log(chalk.green(`Application ${id} deleted successfully.`));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Application control operations
  apps.command('start <id>')
    .description('Start an application')
    .action(async (id) => {
      try {
        const result = await applicationsHandler({ operation: 'start', id });
        console.log(chalk.green(`Application ${id} started successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('stop <id>')
    .description('Stop an application')
    .action(async (id) => {
      try {
        const result = await applicationsHandler({ operation: 'stop', id });
        console.log(chalk.green(`Application ${id} stopped successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  apps.command('restart <id>')
    .description('Restart an application')
    .action(async (id) => {
      try {
        const result = await applicationsHandler({ operation: 'restart', id });
        console.log(chalk.green(`Application ${id} restarted successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Application logs
  apps.command('logs <id>')
    .description('Get application logs')
    .option('--lines <number>', 'Number of log lines to retrieve', '100')
    .action(async (id, options) => {
      try {
        const result = await applicationsHandler({ operation: 'get_logs', id });
        console.log(chalk.green(`Logs for application ${id}:`));
        console.log(result.data);
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Execute command in application container
  apps.command('exec <id>')
    .description('Execute a command inside the application container')
    .argument('<command>', 'Command to execute inside the container')
    .option('--interactive', 'Run command interactively (not yet supported)')
    .action(async (id, command, options) => {
      try {
        const body = JSON.stringify({ command });
        const result = await applicationsHandler({ 
          operation: 'execute_command', 
          id,
          body 
        });
        
        console.log(chalk.green(`Command executed in application ${id}:`));
        console.log(result.data);
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        if (error.message.includes('not available in this Coolify version')) {
          console.log(chalk.yellow('\nNote: This feature may not be supported in your Coolify version.'));
          console.log(chalk.yellow('Alternatives:'));
          console.log(chalk.yellow('1. SSH into your server and run: docker exec <container_name> <command>'));
          console.log(chalk.yellow('2. Use Coolify\'s web interface if available'));
          console.log(chalk.yellow('3. Update to a newer Coolify version that supports this feature'));
        }
        process.exit(1);
      }
    });

  // Environment variables management
  const envs = apps.command('envs')
    .description('Manage application environment variables');

  envs.command('list <id>')
    .description('List environment variables for an application')
    .action(async (id) => {
      try {
        const result = await applicationsHandler({ operation: 'list_envs', id });
        console.log(chalk.green(`Environment variables for application ${id}:`));
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
    .description('Create environment variable for an application')
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
        
        const result = await applicationsHandler({ 
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
    .description('Update environment variable for an application')
    .requiredOption('--env-id <envId>', 'Environment variable ID')
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
        
        const result = await applicationsHandler({ 
          operation: 'update_env', 
          id,
          env_id: options.envId,
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
    .description('Update multiple environment variables for an application')
    .requiredOption('--env-vars <envVars>', 'Environment variables as JSON array')
    .action(async (id, options) => {
      try {
        const envVars = JSON.parse(options.envVars);
        const body = JSON.stringify({ environment_variables: envVars });
        
        const result = await applicationsHandler({ 
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
    .description('Delete environment variable from an application')
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

        await applicationsHandler({ 
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