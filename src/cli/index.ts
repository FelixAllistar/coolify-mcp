#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { configureCoolifyClient } from '../core/coolify-client.js';

// Import command modules
import { registerApplicationsCommands } from './commands/applications.js';
import { registerDatabasesCommands } from './commands/databases.js';
import { registerServicesCommands } from './commands/services.js';
import { registerServersCommands } from './commands/servers.js';
import { registerProjectsCommands } from './commands/projects.js';
import { registerDeploymentsCommands } from './commands/deployments.js';
import { registerPrivateKeysCommands } from './commands/private-keys.js';
import { registerSystemCommands } from './commands/system.js';

// Load environment variables
dotenv.config();

// Configure the Coolify client (only if environment variables are present)
try {
  configureCoolifyClient();
} catch (error) {
  // If configuration fails, we'll handle it in individual commands
  console.warn('Warning: Coolify client not configured. Please set COOLIFY_API_URL and COOLIFY_API_TOKEN environment variables.');
}

// Create the CLI program
const program = new Command();
program
  .name('coolify-cli')
  .description('CLI for interacting with Coolify API')
  .version('1.0.0');

// Register all command groups
registerApplicationsCommands(program);
registerDatabasesCommands(program);
registerServicesCommands(program);
registerServersCommands(program);
registerProjectsCommands(program);
registerDeploymentsCommands(program);
registerPrivateKeysCommands(program);
registerSystemCommands(program);

// Parse command line arguments
program.parse(); 