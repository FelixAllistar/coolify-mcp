#!/usr/bin/env node

// Smart Entry Point - Detects MCP Server vs CLI usage
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Detect if this is being run as MCP server or CLI
const isMcpMode = () => {
  // Check for explicit MCP mode flags (HIGHEST PRIORITY)
  const hasServerFlag = process.argv.includes('--server') || process.argv.includes('--mcp');
  if (hasServerFlag) return true;
  
  // Check for explicit CLI mode flags  
  const hasCliFlag = process.argv.includes('--cli');
  if (hasCliFlag) return false;
  
  // If we have actual CLI command arguments (not just the script name), definitely CLI mode
  const hasCliArgs = process.argv.length > 2 && !process.argv.slice(2).every(arg => arg.startsWith('--'));
  if (hasCliArgs) return false;
  
  // Fallback detection for cases where flags aren't used:
  // MCP servers typically run with stdin not attached to a TTY (piped/redirected)
  // and often have no arguments
  const isStdioMode = !process.stdin.isTTY;
  
  // If stdin is piped/redirected and no CLI args, likely MCP mode
  // BUT: only if no explicit flags were provided (we encourage using --server)
  if (isStdioMode && process.argv.length <= 2) return true;
  
  // Default to CLI mode for terminal usage (TTY) without arguments
  // This allows users to see help when they just run 'coolify-mcp'
  return false;
};

if (isMcpMode()) {
  // Run MCP Server
  console.error('Starting Coolify MCP Server...');
  await import('./mcp-server.js');
} else {
  // Run CLI
  await import('./cli/index.js');
}