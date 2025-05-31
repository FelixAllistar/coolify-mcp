import { Command } from 'commander';
import chalk from 'chalk';
import { projectsHandler } from '../../mcp/tools/projects.js';

export function registerProjectsCommands(program: Command) {
  const projects = program.command('projects')
    .description('Manage projects');
  
  // List projects
  projects.command('list')
    .description('List all projects')
    .action(async () => {
      try {
        const result = await projectsHandler({ operation: 'list' });
        console.log(chalk.green('Projects:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((project: any) => ({
            id: project.uuid,
            name: project.name,
            description: project.description || 'No description',
            created: project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get project details
  projects.command('get <id>')
    .description('Get project details')
    .action(async (id) => {
      try {
        const result = await projectsHandler({ operation: 'get', id });
        console.log(chalk.green('Project Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Create project
  projects.command('create')
    .description('Create a new project')
    .requiredOption('--name <name>', 'Project name')
    .option('--description <description>', 'Project description')
    .action(async (options) => {
      try {
        const body = JSON.stringify({
          name: options.name,
          description: options.description || ''
        });
        
        const result = await projectsHandler({ 
          operation: 'create', 
          body 
        });
        
        console.log(chalk.green('Project created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Update project
  projects.command('update <id>')
    .description('Update a project')
    .option('--name <name>', 'Project name')
    .option('--description <description>', 'Project description')
    .action(async (id, options) => {
      try {
        const updateData: any = {};
        if (options.name) updateData.name = options.name;
        if (options.description) updateData.description = options.description;

        const body = JSON.stringify(updateData);
        
        const result = await projectsHandler({ 
          operation: 'update', 
          id,
          body 
        });
        
        console.log(chalk.green('Project updated:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Delete project
  projects.command('delete <id>')
    .description('Delete a project')
    .option('--force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete project ${id}?`,
              default: false
            }
          ]);
          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled.'));
            return;
          }
        }

        await projectsHandler({ 
          operation: 'delete', 
          id 
        });
        
        console.log(chalk.green(`Project ${id} deleted successfully.`));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Get environment details
  projects.command('environment <id> <environmentName>')
    .description('Get environment details for a project')
    .action(async (id, environmentName) => {
      try {
        const result = await projectsHandler({ 
          operation: 'environment', 
          id,
          environmentNameOrUuid: environmentName
        });
        
        console.log(chalk.green(`Environment details for ${environmentName} in project ${id}:`));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // List all resources
  projects.command('resources')
    .description('List all resources across all projects')
    .action(async () => {
      try {
        const result = await projectsHandler({ operation: 'resources' });
        console.log(chalk.green('All Resources:'));
        if (Array.isArray(result.data)) {
          const groupedResources: { [key: string]: any[] } = {};
          
          result.data.forEach((resource: any) => {
            const type = resource.type || 'Unknown';
            if (!groupedResources[type]) {
              groupedResources[type] = [];
            }
            groupedResources[type].push({
              id: resource.uuid || resource.id,
              name: resource.name,
              status: resource.status || 'Unknown',
              project: resource.project?.name || 'N/A'
            });
          });

          Object.entries(groupedResources).forEach(([type, resources]) => {
            console.log(chalk.blue(`\n${type}s:`));
            console.table(resources);
          });
        } else {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
} 