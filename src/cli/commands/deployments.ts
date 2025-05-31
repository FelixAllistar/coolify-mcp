import { Command } from 'commander';
import chalk from 'chalk';
import { deploymentsHandler } from '../../mcp/tools/deployments.js';

export function registerDeploymentsCommands(program: Command) {
  const deployments = program.command('deployments')
    .description('Manage deployments');
  
  // List deployments
  deployments.command('list')
    .description('List all deployments')
    .action(async () => {
      try {
        const result = await deploymentsHandler({ operation: 'list' });
        console.log(chalk.green('Deployments:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((deployment: any) => ({
            id: deployment.uuid,
            status: deployment.status,
            created: deployment.created_at
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get deployment details
  deployments.command('get <id>')
    .description('Get deployment details')
    .action(async (id) => {
      try {
        const result = await deploymentsHandler({ operation: 'get', id });
        console.log(chalk.green('Deployment Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
} 