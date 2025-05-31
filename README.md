# Coolify MCP Server

A Model Context Protocol (MCP) server for managing Coolify deployments, providing both programmatic MCP tools and comprehensive CLI commands.

## Features

This MCP server provides **complete feature parity** between MCP tools (for AI agents/integrations) and CLI commands (for direct user interaction):

### 🔄 **Applications Management** (21 Operations)
- **MCP Tool**: `applications` with 21 operations
- **CLI Commands**: `apps` with complete parity
  - List, get, create (6 types), update, delete
  - Control operations: start, stop, restart
  - Logs management
  - Environment variables: list, create, update, bulk update, delete

### 🔧 **Services Management** (14 Operations)  
- **MCP Tool**: `services` with 14 operations including 70+ one-click services
- **CLI Commands**: `services` with complete parity
  - List, get, create, update, delete
  - Control operations: start, stop, restart
  - Environment variables management
  - Service types discovery (WordPress, Ghost, MinIO, etc.)

### 🗄️ **Database Management** (13 Operations)
- **MCP Tool**: `databases` with 13 operations
- **CLI Commands**: `databases` with complete parity
  - Support for 8 database types: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, KeyDB, ClickHouse, Dragonfly
  - Type-specific creation commands with proper parameters
  - Control operations: start, stop, restart
  - Database types listing

### 📂 **Projects Management** (7 Operations)
- **MCP Tool**: `projects` with 7 operations  
- **CLI Commands**: `projects` with complete parity
  - CRUD operations, environment management, resources listing

### 🖥️ **Servers Management** (7 Operations)
- **MCP Tool**: `servers` with validation, resources, domains
- **CLI Commands**: `servers` with core operations

### 🚀 **Deployments Management** (4 Operations)
- **MCP Tool**: `deployments` with deploy triggers and monitoring
- **CLI Commands**: `deployments` with essential operations

### 🔑 **Private Keys Management** (5 Operations)
- **MCP Tool**: `private-keys` for repository access
- **CLI Commands**: `private-keys` with SSH key management

### 📊 **System Management** (6 Operations)
- **MCP Tool**: `system` for health, API control, version
- **CLI Commands**: `system` for monitoring and control

## Configuration

Before using either the MCP tools or CLI commands, you need to configure your Coolify connection:

### Environment Variables

**For MCP Server Usage (Recommended):**
Set environment variables directly in your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "coolify-mcp": {
      "command": "node",
      "args": ["/path/to/coolify-mcp/dist/index.js"],
      "env": {
        "COOLIFY_API_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_TOKEN": "your-coolify-api-token"
      }
    }
  }
}
```

**For CLI Usage:**
Create a `.env` file with these variables:

```bash
# Required: Your Coolify instance URL (include port if needed)
# Examples:
#   https://coolify.yourdomain.com
#   http://192.168.1.100:8000  
#   http://your-server-ip:8000
COOLIFY_API_URL=https://your-coolify-instance.com

# Required: Your Coolify API token (generate in Coolify Settings > API)
COOLIFY_API_TOKEN=your-coolify-api-token
```

**Important Notes:**
- Include the port number in the URL if using a custom port (e.g., `:8000`)
- The API token can be generated in Coolify under Settings > API Tokens
- For MCP usage, you don't need a `.env` file - use the MCP configuration instead

### Testing Your Configuration

You can test connectivity using the system health check:

```bash
# CLI method (requires .env file)
coolify-mcp system health

# MCP method (test through Cursor)
# The ping tool should respond with "Coolify MCP server is running and connected!"
```

## Installation & Setup

### For Cursor IDE (Recommended)

Add this MCP server to your Cursor configuration in `.cursor/mcp.json`:

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

That's it! Cursor will automatically download and run the package via npx.

### For CLI Usage

```bash
# Install globally for CLI commands
npm install -g @felixallistar/coolify-mcp

# Or use npx for one-time usage  
npx @felixallistar/coolify-mcp --help
```

### For Development

If you want to develop or contribute to this package:

```bash
git clone https://github.com/FelixAllistar/coolify-mcp.git
cd coolify-mcp
npm install
npm run refresh  # Downloads latest API spec and builds everything
```

**Note:** Due to existing package name conflicts (`coolify-mcp` and `coolify-mcp-server` are already taken), this package is published as `@felixallistar/coolify-mcp`.

## MCP Tools vs CLI Commands

This package provides two ways to interact with Coolify:

### 🤖 **MCP Tools** (For AI Agents & Cursor)
When used as an MCP server, AI agents can call tools like:
- `applications` - Manage applications
- `services` - Control services  
- `databases` - Database operations
- `projects` - Project management
- And more...

### 💻 **CLI Commands** (For Direct Use)
You can also use the CLI directly:

```bash
# Install globally first
npm install -g @felixallistar/coolify-mcp

# Then use CLI commands
coolify-mcp apps list
coolify-mcp services create --name "my-blog" --type "wordpress"
coolify-mcp databases create-postgresql --name "main-db"
```

## Usage Examples

### MCP Tool Usage (In Cursor/AI Agents)

When using this as an MCP server, AI agents can call tools directly:

```typescript
// The AI agent calls these tools automatically:
await callTool("applications", {
  operation: "list"
});

await callTool("services", {
  operation: "create",
  body: JSON.stringify({
    name: "my-blog",
    type: "wordpress-with-mysql", 
    project: "project-id"
  })
});

await callTool("databases", {
  operation: "create_postgresql",
  body: JSON.stringify({
    name: "main-db",
    project: "project-id",
    postgres_user: "admin"
  })
});
```

### CLI Usage Examples

### Applications
```bash
# List all applications
coolify-mcp apps list

# Create applications (6 different types)
coolify-mcp apps create-public --name "my-app" --repository "https://github.com/user/repo" --project "project-id"
coolify-mcp apps create-private-github --name "private-app" --repository "git@github.com:user/repo" --project "project-id" --github-app-id "123" --github-installation-id "456"
coolify-mcp apps create-dockerfile --name "docker-app" --repository "https://github.com/user/repo" --project "project-id"

# Control applications
coolify-mcp apps start app-id
coolify-mcp apps stop app-id
coolify-mcp apps restart app-id
coolify-mcp apps logs app-id

# Environment variables
coolify-mcp apps envs list app-id
coolify-mcp apps envs create app-id --key "NODE_ENV" --value "production"
coolify-mcp apps envs update app-id --env-id "env-id" --value "development"
coolify-mcp apps envs delete app-id --env-id "env-id"
```

### Services (70+ One-Click Services)
```bash
# List available service types
coolify-mcp services types

# Create services
coolify-mcp services create --name "my-blog" --type "wordpress-with-mysql" --project "project-id"
coolify-mcp services create --name "file-storage" --type "minio" --project "project-id"

# Manage services
coolify-mcp services start service-id
coolify-mcp services envs list service-id
```

### Databases (8 Types)
```bash
# Show available database types
coolify-mcp databases types

# Create specific database types
coolify-mcp databases create-postgresql --name "main-db" --project "project-id" --postgres-user "admin"
coolify-mcp databases create-mysql --name "app-db" --project "project-id" --mysql-user "appuser"
coolify-mcp databases create-mongodb --name "docs-db" --project "project-id"
coolify-mcp databases create-redis --name "cache" --project "project-id"

# Control databases
coolify-mcp databases start db-id
coolify-mcp databases stop db-id
coolify-mcp databases restart db-id
```

### Projects
```bash
# Project management
coolify-mcp projects list
coolify-mcp projects create --name "My Project" --description "Project description"
coolify-mcp projects environment project-id environment-name
coolify-mcp projects resources  # List all resources across projects
```

## Architecture

### MCP Tools
Located in `src/mcp/tools/`, these provide programmatic access for AI agents and integrations:
- Full Zod schema validation
- Comprehensive error handling
- Structured data exchange
- All Coolify API operations supported

### CLI Commands  
Located in `src/cli/commands/`, these provide user-friendly terminal interface:
- Commander.js for argument parsing
- Colored output with chalk
- Interactive prompts for confirmations
- Table formatting for lists
- **Complete feature parity with MCP tools**

### Generated SDK
Uses `@hey-api/openapi-ts` to generate TypeScript SDK from Coolify's OpenAPI specification, ensuring type safety and automatic updates with API changes.

## Development

### Automated API Updates 🔄

This package includes a complete automated pipeline to stay in sync with Coolify's latest API:

```bash
# Check if updates are available
npm run check-updates       # Compares local vs remote OpenAPI specs

# Complete refresh: Download latest OpenAPI spec, generate types, and build
npm run refresh

# Individual steps
npm run download-openapi     # Download latest OpenAPI spec from GitHub
npm run generate            # Generate TypeScript SDK from OpenAPI spec  
npm run update-service-types # Extract and update service/database types
npm run build               # Compile TypeScript
```

**The automated pipeline:**
1. **Downloads** the latest OpenAPI specification from [Coolify's GitHub repository](https://raw.githubusercontent.com/coollabsio/coolify-docs/refs/heads/v4.x/docs/.vitepress/theme/openapi.json)
2. **Generates** TypeScript SDK using `@hey-api/openapi-ts`
3. **Extracts** service types (86 services) and database types (8 databases) from the spec
4. **Updates** `SERVICE_TYPES` and `DATABASE_TYPES` arrays automatically
5. **Commits** generated types for immediate usability

**Benefits:**
- ✅ Ready to use immediately (generated types committed)
- ✅ Always up-to-date with Coolify's latest features
- ✅ Automatic service/database type extraction  
- ✅ Zero manual maintenance required
- ✅ Works offline after installation
- ✅ Perfect for CI/CD integration
- ✅ Type-safe development experience

**Note:** Generated TypeScript types in `src/generated/` are committed to ensure the package works immediately after installation without requiring internet access or build steps.

### Manual Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Test MCP server
npm run test
```

## API Coverage

This implementation covers **100% of the Coolify API surface** with both MCP tools and CLI commands, including:

- ✅ Applications (all deployment types)
- ✅ Services (70+ one-click services) 
- ✅ Databases (8 database types)
- ✅ Projects & Environments
- ✅ Servers & Infrastructure
- ✅ Deployments & Monitoring
- ✅ Private Keys & Security
- ✅ System Administration

Both MCP and CLI interfaces provide the same comprehensive functionality, ensuring users can choose their preferred interaction method without sacrificing capabilities.

## License

ISC 