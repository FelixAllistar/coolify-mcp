# Coolify MCP Server

A Model Context Protocol (MCP) server for managing Coolify deployments, providing both programmatic MCP tools and comprehensive CLI commands.

## Quick Start

### Option 1: MCP Integration (Recommended)

MCP (Model Control Protocol) lets you manage Coolify directly from your AI editor.

#### 1. Add to your MCP configuration

**For Cursor:**
Add to `~/.cursor/mcp.json` or `<project_folder>/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "coolify-mcp": {
      "command": "npx",
      "args": ["-y", "@felixallistar/coolify-mcp"],
      "env": {
        "COOLIFY_API_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_TOKEN": "your-coolify-api-token"
      }
    }
  }
}
```

**For VS Code:**
Add to `<project_folder>/.vscode/mcp.json`:

```json
{
  "servers": {
    "coolify-mcp": {
      "command": "npx",
      "args": ["-y", "@felixallistar/coolify-mcp"],
      "env": {
        "COOLIFY_API_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_TOKEN": "your-coolify-api-token"
      },
      "type": "stdio"
    }
  }
}
```

> 🔑 Replace `your-coolify-instance.com` with your actual Coolify URL and `your-coolify-api-token` with your API token from Coolify Settings > API.

#### 2. (Cursor only) Enable Coolify MCP

Open Cursor Settings (Ctrl+Shift+J) ➡ Click on MCP tab ➡ Enable coolify-mcp with the toggle

#### 3. Start managing Coolify

In your AI chat, try commands like:

```txt
List my Coolify applications
Create a new WordPress service called "my-blog" 
Deploy my app with ID "app-123"
Show me all available database types
```

### Option 2: CLI Usage

#### Installation

```bash
# Install globally for CLI usage
npm install -g @felixallistar/coolify-mcp

# Test the installation
coolify-mcp --help
```

#### Configuration

Create a `.env` file in your project directory:

```bash
# Required: Your Coolify instance URL (include port if needed)
COOLIFY_API_URL=https://your-coolify-instance.com

# Required: Your Coolify API token (generate in Coolify Settings > API)
COOLIFY_API_TOKEN=your-coolify-api-token
```

#### Common Commands

```bash
# Application management
coolify-mcp apps list
coolify-mcp apps create-public --name "my-app" --repository "https://github.com/user/repo" --project "project-id"
coolify-mcp apps start app-id

# Service management (70+ one-click services)
coolify-mcp services types
coolify-mcp services create --name "my-blog" --type "wordpress-with-mysql" --project "project-id"

# Database management (8 database types)
coolify-mcp databases create-postgresql --name "main-db" --project "project-id"
coolify-mcp databases create-redis --name "cache" --project "project-id"

# Project management
coolify-mcp projects list
coolify-mcp projects create --name "My Project"

# Test connectivity
coolify-mcp system health
```

## Features

### 🔄 **Applications** (21 Operations)
Complete application lifecycle management with 6 deployment types, environment variables, logs, and control operations.

### 🔧 **Services** (14 Operations)  
70+ one-click services including WordPress, Ghost, MinIO, and more with full environment management.

### 🗄️ **Databases** (13 Operations)
8 database types: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, KeyDB, ClickHouse, Dragonfly.

### 📂 **Projects, Servers, Deployments**
Complete infrastructure management including private keys, system administration, and deployment monitoring.

## MCP Tools vs CLI Commands

This package provides two interaction methods with **complete feature parity**:

- **🤖 MCP Tools**: For AI agents and Cursor integration (recommended)
- **💻 CLI Commands**: For direct terminal usage

Both interfaces provide identical functionality - choose based on your workflow.

## Development

### Automated API Updates

Stay in sync with Coolify's latest API:

```bash
npm run refresh           # Download latest API spec and rebuild
npm run check-updates     # Check for API changes
```

### Manual Development

```bash
git clone https://github.com/FelixAllistar/coolify-mcp.git
cd coolify-mcp
npm install
npm run refresh
npm run dev
```

## API Coverage

✅ **100% Coolify API Coverage** - Applications, Services, Databases, Projects, Servers, Deployments, Private Keys, System Administration

## License

GLWTPL (Good Luck With That Public License) - see [LICENSE](LICENSE) file for details.

*This software might just work or not, there is no third option. Good luck and Godspeed.* 

## MCP Configuration

### Option 1: Using npx (Recommended - Simple!)
```json
{
  "mcpServers": {
    "coolify-mcp": {
      "command": "npx",
      "args": ["-y", "@felixallistar/coolify-mcp"],
      "env": {
        "COOLIFY_API_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_TOKEN": "your-coolify-api-token"
      }
    }
  }
}
```

### Option 2: Direct node execution
```json
{
  "mcpServers": {
    "coolify-mcp": {
      "command": "node",
      "args": ["node_modules/@felixallistar/coolify-mcp/dist/index.js"],
      "env": {
        "COOLIFY_API_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_TOKEN": "your-coolify-api-token"
      }
    }
  }
}
```

### Option 3: Global installation
```bash
npm install -g @felixallistar/coolify-mcp
```

Then use the MCP server binary:
```json
{
  "mcpServers": {
    "coolify-mcp": {
      "command": "coolify-mcp",
      "env": {
        "COOLIFY_API_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_TOKEN": "your-coolify-api-token"
      }
    }
  }
}
```

## CLI Usage

For CLI commands, simply add arguments to the `coolify-mcp` command:

```bash
# Using npx (no installation needed)
npx @felixallistar/coolify-mcp --help
npx @felixallistar/coolify-mcp apps list

# Or install globally for easier CLI usage
npm install -g @felixallistar/coolify-mcp
coolify-mcp --help
coolify-mcp apps list
```

**Smart Detection:** 
- `coolify-mcp` (no args) → MCP server mode
- `coolify-mcp <command>` → CLI mode 