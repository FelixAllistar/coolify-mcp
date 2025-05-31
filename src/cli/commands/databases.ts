import { Command } from 'commander';
import chalk from 'chalk';
import { databasesHandler } from '../../mcp/tools/databases.js';

// Available database types
const DATABASE_TYPES = [
  'postgresql', 'mysql', 'mariadb', 'mongodb', 
  'redis', 'keydb', 'clickhouse', 'dragonfly'
] as const;

export function registerDatabasesCommands(program: Command) {
  const databases = program.command('databases')
    .description('Manage databases (PostgreSQL, MySQL, MongoDB, Redis, etc.)');
  
  // List databases
  databases.command('list')
    .description('List all databases')
    .action(async () => {
      try {
        const result = await databasesHandler({ operation: 'list' });
        console.log(chalk.green('Databases:'));
        if (Array.isArray(result.data)) {
          console.table(result.data.map((db: any) => ({
            id: db.uuid,
            name: db.name,
            type: db.type,
            status: db.status,
            project: db.project?.name || 'N/A',
            created: db.created_at ? new Date(db.created_at).toLocaleDateString() : 'N/A'
          })));
        } else {
          console.log(result.data);
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  // Get database details
  databases.command('get <id>')
    .description('Get database details')
    .action(async (id) => {
      try {
        const result = await databasesHandler({ operation: 'get', id });
        console.log(chalk.green('Database Details:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create PostgreSQL database
  databases.command('create-postgresql')
    .description('Create a new PostgreSQL database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--postgres-user <user>', 'PostgreSQL username', 'postgres')
    .option('--postgres-password <password>', 'PostgreSQL password (auto-generated if not provided)')
    .option('--postgres-db <dbname>', 'PostgreSQL database name')
    .option('--version <version>', 'PostgreSQL version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          postgres_user: options.postgresUser,
          postgres_db: options.postgresDb || options.name,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.postgresPassword) dbData.postgres_password = options.postgresPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_postgresql', 
          body 
        });
        
        console.log(chalk.green('PostgreSQL database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create MySQL database
  databases.command('create-mysql')
    .description('Create a new MySQL database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--mysql-user <user>', 'MySQL username', 'mysql')
    .option('--mysql-password <password>', 'MySQL password (auto-generated if not provided)')
    .option('--mysql-database <dbname>', 'MySQL database name')
    .option('--mysql-root-password <password>', 'MySQL root password (auto-generated if not provided)')
    .option('--version <version>', 'MySQL version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          mysql_user: options.mysqlUser,
          mysql_database: options.mysqlDatabase || options.name,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.mysqlPassword) dbData.mysql_password = options.mysqlPassword;
        if (options.mysqlRootPassword) dbData.mysql_root_password = options.mysqlRootPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_mysql', 
          body 
        });
        
        console.log(chalk.green('MySQL database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create MariaDB database
  databases.command('create-mariadb')
    .description('Create a new MariaDB database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--mariadb-user <user>', 'MariaDB username', 'mariadb')
    .option('--mariadb-password <password>', 'MariaDB password (auto-generated if not provided)')
    .option('--mariadb-database <dbname>', 'MariaDB database name')
    .option('--mariadb-root-password <password>', 'MariaDB root password (auto-generated if not provided)')
    .option('--version <version>', 'MariaDB version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          mariadb_user: options.mariadbUser,
          mariadb_database: options.mariadbDatabase || options.name,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.mariadbPassword) dbData.mariadb_password = options.mariadbPassword;
        if (options.mariadbRootPassword) dbData.mariadb_root_password = options.mariadbRootPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_mariadb', 
          body 
        });
        
        console.log(chalk.green('MariaDB database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create MongoDB database
  databases.command('create-mongodb')
    .description('Create a new MongoDB database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--mongo-initdb-root-username <user>', 'MongoDB root username', 'root')
    .option('--mongo-initdb-root-password <password>', 'MongoDB root password (auto-generated if not provided)')
    .option('--mongo-initdb-database <dbname>', 'MongoDB database name')
    .option('--version <version>', 'MongoDB version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          mongo_initdb_root_username: options.mongoInitdbRootUsername,
          mongo_initdb_database: options.mongoInitdbDatabase || options.name,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.mongoInitdbRootPassword) dbData.mongo_initdb_root_password = options.mongoInitdbRootPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_mongodb', 
          body 
        });
        
        console.log(chalk.green('MongoDB database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create Redis database
  databases.command('create-redis')
    .description('Create a new Redis database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--redis-password <password>', 'Redis password (no password if not provided)')
    .option('--version <version>', 'Redis version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.redisPassword) dbData.redis_password = options.redisPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_redis', 
          body 
        });
        
        console.log(chalk.green('Redis database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create KeyDB database
  databases.command('create-keydb')
    .description('Create a new KeyDB database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--keydb-password <password>', 'KeyDB password (no password if not provided)')
    .option('--version <version>', 'KeyDB version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.keydbPassword) dbData.keydb_password = options.keydbPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_keydb', 
          body 
        });
        
        console.log(chalk.green('KeyDB database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create ClickHouse database
  databases.command('create-clickhouse')
    .description('Create a new ClickHouse database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--clickhouse-admin-user <user>', 'ClickHouse admin username', 'admin')
    .option('--clickhouse-admin-password <password>', 'ClickHouse admin password (auto-generated if not provided)')
    .option('--version <version>', 'ClickHouse version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          clickhouse_admin_user: options.clickhouseAdminUser,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.clickhouseAdminPassword) dbData.clickhouse_admin_password = options.clickhouseAdminPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_clickhouse', 
          body 
        });
        
        console.log(chalk.green('ClickHouse database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Create Dragonfly database
  databases.command('create-dragonfly')
    .description('Create a new Dragonfly database')
    .requiredOption('--name <name>', 'Database name')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--description <description>', 'Database description')
    .option('--dragonfly-password <password>', 'Dragonfly password (no password if not provided)')
    .option('--version <version>', 'Dragonfly version', 'latest')
    .action(async (options) => {
      try {
        const dbData: any = {
          name: options.name,
          project_uuid: options.project,
          version: options.version
        };

        if (options.description) dbData.description = options.description;
        if (options.dragonflyPassword) dbData.dragonfly_password = options.dragonflyPassword;

        const body = JSON.stringify(dbData);
        
        const result = await databasesHandler({ 
          operation: 'create_dragonfly', 
          body 
        });
        
        console.log(chalk.green('Dragonfly database created:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Update database
  databases.command('update <id>')
    .description('Update a database')
    .option('--name <name>', 'Database name')
    .option('--description <description>', 'Database description')
    .action(async (id, options) => {
      try {
        const updateData: any = {};
        if (options.name) updateData.name = options.name;
        if (options.description) updateData.description = options.description;

        const body = JSON.stringify(updateData);
        
        const result = await databasesHandler({ 
          operation: 'update', 
          id,
          body 
        });
        
        console.log(chalk.green('Database updated:'));
        console.log(JSON.stringify(result.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Delete database
  databases.command('delete <id>')
    .description('Delete a database')
    .option('--force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete database ${id}?`,
              default: false
            }
          ]);
          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled.'));
            return;
          }
        }

        await databasesHandler({ 
          operation: 'delete', 
          id 
        });
        
        console.log(chalk.green(`Database ${id} deleted successfully.`));
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Database control operations
  databases.command('start <id>')
    .description('Start a database')
    .action(async (id) => {
      try {
        const result = await databasesHandler({ operation: 'start', id });
        console.log(chalk.green(`Database ${id} started successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  databases.command('stop <id>')
    .description('Stop a database')
    .action(async (id) => {
      try {
        const result = await databasesHandler({ operation: 'stop', id });
        console.log(chalk.green(`Database ${id} stopped successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  databases.command('restart <id>')
    .description('Restart a database')
    .action(async (id) => {
      try {
        const result = await databasesHandler({ operation: 'restart', id });
        console.log(chalk.green(`Database ${id} restarted successfully.`));
        if (result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  // Show available database types
  databases.command('types')
    .description('Show available database types')
    .action(() => {
      console.log(chalk.green('Available Database Types:'));
      console.log(chalk.blue(`\nRelational Databases:`));
      console.log('  • postgresql - PostgreSQL database');
      console.log('  • mysql - MySQL database');
      console.log('  • mariadb - MariaDB database');
      
      console.log(chalk.blue(`\nDocument Databases:`));
      console.log('  • mongodb - MongoDB database');
      
      console.log(chalk.blue(`\nKey-Value Stores:`));
      console.log('  • redis - Redis database');
      console.log('  • keydb - KeyDB database');
      console.log('  • dragonfly - Dragonfly database');
      
      console.log(chalk.blue(`\nAnalytical Databases:`));
      console.log('  • clickhouse - ClickHouse database');
      
      console.log(chalk.cyan('\nUse these types with the appropriate "create-<type>" commands.'));
    });
} 