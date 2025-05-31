import { Command } from 'commander';
import chalk from 'chalk';
import { privateKeysHandler } from '../../mcp/tools/private-keys.js';

export function registerPrivateKeysCommands(program: Command) {
  const privateKeys = program.command('private-keys')
    .description('Manage private keys');
  
  // List private keys
  privateKeys.command('list')
    .description('List all private keys')
    .action(async () => {
      try {
        const result = await privateKeysHandler({ operation: 'list' });
        console.log(chalk.green('Private Keys:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((key: any) => ({
            id: key.uuid,
            name: key.name,
            description: key.description || 'No description'
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get private key details
  privateKeys.command('get <id>')
    .description('Get private key details')
    .action(async (id) => {
      try {
        const result = await privateKeysHandler({ operation: 'get', id });
        console.log(chalk.green('Private Key Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
} 