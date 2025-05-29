# Coolify MCP Implementation Plan

## Overview
Create a comprehensive MCP (Model Context Protocol) server for Coolify's deployment platform using the TaskMaster architecture pattern with intelligent command filtering and organization.

**Coolify** is an open-source PaaS that allows self-hosting of databases, services, and applications with ease. Their [extensive API](https://coolify.io/docs/api-reference/api/operations/version) provides 70+ endpoints across multiple resource types.

## Architecture (Following TaskMaster Pattern)

This follows the proven [microservices design principles](https://medium.com/platform-engineer/microservices-design-guide-eca0b799a7e8) with:
- **Smart endpoints and dumb pipes** - Each service owns a well-defined API
- **Decentralized data management** - Each service manages its own data
- **Independent scaling** - Components can be developed and deployed independently

### 1. Core Logic Layer (`/src/core/`)

**Purpose:** Business logic that can be shared between MCP tools and CLI commands

- **`coolify-client.js`** - HTTP client with authentication, rate limiting, error handling
- **`resource-manager.js`** - Unified resource management (apps, services, databases)
- **`deployment-manager.js`** - Deployment workflows and status tracking  
- **`server-manager.js`** - Server connection and validation logic
- **`environment-manager.js`** - Environment variables and configuration
- **`project-manager.js`** - Project and team management
- **`monitoring-manager.js`** - Health checks, logs, and alerts

### 2. Direct Function Wrappers (`/src/mcp/direct-functions/`)

**Purpose:** Thin adapters that call core logic and format for MCP responses

- Handle MCP-specific logging and error formatting
- Pass through telemetry data
- Convert core results to structured MCP responses
- Manage session state and context

### 3. MCP Tools (`/src/mcp/tools/`)

**Purpose:** Exposed endpoints for MCP clients (like Cursor)

- Grouped by resource type (applications, services, databases, etc.)
- Smart command filtering and discovery
- Zod schemas for parameter validation
- Auto-generated help and documentation

### 4. CLI Commands (`/src/cli/commands/`)

**Purpose:** Command-line interface for standalone usage

- Mirror MCP functionality for direct user interaction
- Same underlying core logic as MCP tools
- Commander.js integration for argument parsing
- Rich terminal output with colors and formatting

## Smart Command Organization

### Resource Groups
Based on [Coolify's API structure](https://coolify.io/docs/api-reference/api/operations/version):

#### 1. **Applications** (19 endpoints)
- **Create Operations:** Public repos, private repos, Dockerfile, Docker image, Docker Compose
- **Management:** Get, delete, update, start, stop, restart
- **Environment:** List/create/update/delete environment variables (bulk operations)
- **Monitoring:** Get application logs

#### 2. **Services** (14 endpoints) 
- **One-click Services:** Deploy pre-configured services (databases, monitoring tools, etc.)
- **Lifecycle:** Create, get, delete, update, start, stop, restart
- **Configuration:** Environment variables management
- **Service Types:** 50+ supported services (PostgreSQL, Redis, MongoDB, Grafana, etc.)

#### 3. **Databases** (13 endpoints)
- **Database Types:** PostgreSQL, MySQL, MariaDB, MongoDB, Redis, DragonFly, KeyDB, Clickhouse
- **Operations:** Create, manage, backup, restore
- **Lifecycle:** Start, stop, restart database instances

#### 4. **Servers** (8 endpoints)
- **Management:** Add, validate, update, delete servers
- **Monitoring:** Resource usage, domains, health checks
- **Multi-server:** Support for server clusters and Docker Swarm

#### 5. **Projects** (6 endpoints)
- **Organization:** Create and manage projects
- **Team Management:** Handle team members and permissions
- **Environment:** Project-level environment management

#### 6. **Deployments** (4 endpoints)
- **Deployment Control:** Deploy by tag/UUID, force rebuild, PR deployments
- **Tracking:** List deployments, get deployment status
- **History:** Deployment logs and history

### Intelligent Filtering System

```javascript
// Smart command discovery based on context
const commandFilters = {
  // Show only relevant commands based on current state
  contextual: (userInput, currentResources) => {
    if (!currentResources.servers.length) {
      return ['add_server', 'validate_server', 'list_servers'];
    }
    if (!currentResources.projects.length) {
      return ['create_project', 'list_projects'];
    }
    if (!currentResources.applications.length) {
      return ['create_application', 'deploy_application'];
    }
    return ['deploy', 'get_logs', 'manage_environment', 'monitor_resources'];
  },
  
  // Frequency-based filtering  
  popular: [
    'create_application', 
    'deploy', 
    'get_logs', 
    'list_resources',
    'restart_service',
    'update_environment'
  ],
  
  // Workflow-based grouping
  workflows: {
    'getting-started': [
      'add_server', 
      'validate_server', 
      'create_project', 
      'create_application'
    ],
    'deployment': [
      'deploy', 
      'get_deployment_status', 
      'get_logs',
      'rollback_deployment'
    ],
    'management': [
      'list_resources', 
      'update_environment', 
      'restart_service',
      'backup_database'
    ],
    'monitoring': [
      'get_resource_health',
      'monitor_deployments',
      'setup_alerts',
      'view_analytics'
    ]
  }
}
```

## Key MCP Tools

### 1. Resource Discovery & Management
- **`discover_resources`** - Scan and inventory all Coolify resources
- **`get_resource_health`** - Health checks across all resources  
- **`list_resources`** - Paginated resource listing with filtering
- **`bulk_operations`** - Batch operations on multiple resources

### 2. Application Lifecycle
- **`create_application`** - Create app with smart defaults and validation
- **`deploy_application`** - Deploy with build options and environment
- **`get_application_logs`** - Streaming application logs
- **`manage_application`** - Start, stop, restart, delete operations

### 3. Deployment Workflows
- **`deploy_by_tag`** - Deploy specific versions/tags
- **`deploy_pr`** - Deploy pull request builds for testing
- **`get_deployment_status`** - Real-time deployment progress
- **`rollback_deployment`** - Safe rollback with confirmation
- **`deploy_stack`** - Deploy entire application stacks

### 4. Environment Management  
- **`get_environment_variables`** - List environment variables
- **`update_environment_variables`** - Bulk update environment variables
- **`sync_environments`** - Sync env vars across environments
- **`backup_configuration`** - Backup all configurations
- **`clone_application`** - Clone app with environment

### 5. Service Management
- **`create_service`** - Deploy one-click services (databases, tools)
- **`list_available_services`** - Browse service catalog
- **`manage_service`** - Service lifecycle operations
- **`backup_database`** - Database backup operations

### 6. Server & Infrastructure
- **`add_server`** - Connect new servers to Coolify
- **`validate_server`** - Test server connectivity and requirements
- **`get_server_resources`** - Monitor server resource usage
- **`manage_server`** - Server lifecycle and configuration

### 7. Monitoring & Observability
- **`get_deployment_logs`** - Streaming deployment logs
- **`monitor_resources`** - Real-time resource monitoring
- **`setup_alerts`** - Configure alerting rules
- **`get_analytics`** - Resource usage analytics

### 8. Team & Project Management
- **`create_project`** - Create and configure projects
- **`manage_team_members`** - Team access and permissions
- **`get_project_environment`** - Project-level configuration

## Configuration

```javascript
// coolify-config.js
export const coolifyConfig = {
  // Connection settings
  apiUrl: process.env.COOLIFY_API_URL || 'https://app.coolify.io',
  apiToken: process.env.COOLIFY_API_TOKEN,
  
  // Rate limiting
  rateLimiting: {
    requestsPerMinute: 60,
    burstSize: 10,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Smart defaults
  defaults: {
    server: 'auto-detect', // Use first available server
    project: 'default',    // Default project name
    domain: 'auto-generate', // Generate domains automatically
    buildPack: 'auto-detect', // Detect from repo
    environment: 'production'
  },
  
  // Workflow automation
  workflows: {
    deploymentChecks: true,        // Pre-deployment validation
    autoBackup: true,              // Backup before deployments
    rollbackOnFailure: false,      // Auto-rollback failed deployments
    notificationWebhooks: [],      // Webhook URLs for notifications
    logRetention: '30d'            // How long to keep logs
  },
  
  // Command filtering
  ui: {
    showAdvancedCommands: false,   // Hide complex commands by default
    groupByWorkflow: true,         // Group commands by common workflows
    contextualHelp: true           // Show relevant commands based on state
  }
}
```

## Implementation Priority

### Phase 1 - Core Infrastructure (Week 1-2)
1. **HTTP Client Setup**
   - Authentication handling
   - Rate limiting and retry logic
   - Error handling and logging
   
2. **Basic Resource Operations**
   - CRUD operations for all resource types
   - List/filter/search functionality
   - Pagination support

3. **Server Connection Management**
   - Server validation and health checks
   - Multi-server support
   - Connection pooling

### Phase 2 - Application Management (Week 3-4)
1. **Application Lifecycle**
   - Create applications from various sources
   - Deploy with different strategies
   - Manage application state

2. **Environment Variable Management**
   - CRUD operations for environment variables
   - Bulk operations and templating
   - Environment synchronization

3. **Log Streaming**
   - Real-time log streaming
   - Log filtering and search
   - Historical log access

### Phase 3 - Advanced Features (Week 5-6)
1. **Service Management**
   - One-click service deployment
   - Database management and backups
   - Service-specific configurations

2. **Multi-server Deployments**
   - Docker Swarm support
   - Load balancing configuration
   - Cross-server orchestration

3. **Backup and Restore**
   - Automated backup scheduling
   - Point-in-time restore
   - Configuration backup/restore

### Phase 4 - Intelligence & Automation (Week 7-8)
1. **Smart Command Filtering**
   - Context-aware command suggestions
   - Workflow-based command grouping
   - Personalized command recommendations

2. **Workflow Automation**
   - Pre-defined deployment workflows
   - Custom workflow creation
   - Workflow templates and sharing

3. **Health Monitoring and Alerting**
   - Resource health monitoring
   - Custom alert rules
   - Integration with external monitoring

## File Structure

```
coolify-mcp/
├── src/
│   ├── core/                          # Shared business logic
│   │   ├── coolify-client.js          # HTTP client & auth
│   │   ├── resource-manager.js        # Resource CRUD operations
│   │   ├── deployment-manager.js      # Deployment workflows
│   │   ├── server-manager.js          # Server management
│   │   ├── environment-manager.js     # Environment variables
│   │   ├── project-manager.js         # Projects & teams
│   │   └── monitoring-manager.js      # Health & monitoring
│   │
│   ├── mcp/                           # MCP server implementation
│   │   ├── direct-functions/          # MCP adapters
│   │   ├── tools/                     # MCP tool definitions
│   │   └── server.js                  # MCP server entry point
│   │
│   ├── cli/                           # CLI implementation
│   │   ├── commands/                  # CLI command definitions
│   │   └── index.js                   # CLI entry point
│   │
│   ├── utils/                         # Shared utilities
│   │   ├── validation.js              # Schema validation
│   │   ├── formatting.js              # Output formatting
│   │   └── config.js                  # Configuration management
│   │
│   └── types/                         # TypeScript definitions
│       ├── coolify-api.ts             # API response types
│       └── mcp-tools.ts               # MCP tool types
│
├── config/
│   ├── coolify-config.js              # Default configuration
│   └── mcp-config.json                # MCP server configuration
│
├── docs/                              # Documentation
│   ├── README.md                      # Getting started guide
│   ├── API.md                         # API documentation
│   └── WORKFLOWS.md                   # Common workflows
│
├── tests/                             # Test files
│   ├── core/                          # Core logic tests
│   ├── mcp/                           # MCP tool tests
│   └── integration/                   # Integration tests
│
└── package.json                       # Dependencies and scripts
```

## Testing Strategy

### Unit Tests
- Core business logic functions
- HTTP client error handling
- Configuration validation
- Data transformation utilities

### Integration Tests  
- Full API workflows (create app → deploy → monitor)
- Multi-server operations
- Error scenarios and rollback procedures
- Performance under load

### MCP-Specific Tests
- Tool parameter validation
- Response formatting
- Session management
- Error propagation

## Documentation Requirements

### User Documentation
1. **Getting Started Guide** - Setup and basic usage
2. **Workflow Examples** - Common deployment scenarios  
3. **API Reference** - Complete tool documentation
4. **Troubleshooting** - Common issues and solutions

### Developer Documentation
1. **Architecture Overview** - System design and patterns
2. **Core API Documentation** - Business logic interfaces
3. **Extension Guide** - Adding new tools and workflows
4. **Testing Guide** - How to test new features

## Success Metrics

### Functionality
- ✅ 100% API coverage of Coolify endpoints
- ✅ Sub-second response times for common operations
- ✅ Zero-downtime deployments
- ✅ Comprehensive error handling and recovery

### Usability
- ✅ Context-aware command suggestions
- ✅ Intuitive workflow organization
- ✅ Clear error messages and guidance
- ✅ Comprehensive help system

### Reliability  
- ✅ 99.9% uptime for MCP server
- ✅ Graceful handling of Coolify API changes
- ✅ Automatic retry and recovery mechanisms
- ✅ Data consistency across operations

This architecture provides a clean, maintainable foundation that can grow with Coolify's API while offering both programmatic (MCP) and command-line interfaces for maximum flexibility. 