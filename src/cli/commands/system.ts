import { Command } from 'commander';
import chalk from 'chalk';
import { systemHandler } from '../../mcp/tools/system.js';

export function registerSystemCommands(program: Command) {
  const system = program.command('system')
    .description('System operations');
  
  // Get system info
  system.command('info')
    .description('Get system information')
    .action(async () => {
      try {
        const result = await systemHandler({ operation: 'info' });
        console.log(chalk.green('System Information:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
} 