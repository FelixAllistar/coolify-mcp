#!/usr/bin/env node

// Smart Entry Point - Detects MCP Server vs CLI usage
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Detect if this is being run as MCP server or CLI
const isMcpMode = () => {
  // MCP servers typically run with no arguments and use stdio
  // CLI usage will have command arguments
  const hasCliArgs = process.argv.length > 2;
  const isStdioMode = !process.stdin.isTTY;
  
  // If we have CLI arguments, definitely CLI mode
  if (hasCliArgs) return false;
  
  // If no CLI args and stdin is not a TTY (piped), likely MCP mode
  if (isStdioMode) return true;
  
  // Default to MCP mode for npx usage without args
  return true;
};

if (isMcpMode()) {
  // Run MCP Server
  console.error('Starting Coolify MCP Server...');
  await import('./mcp-server.js');
} else {
  // Run CLI
  console.error('Starting Coolify CLI...');
  await import('./cli/index.js');
}