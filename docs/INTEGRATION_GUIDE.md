# Enterprise AI Agents - Integration Guide

**Version:** 1.0.0 | **Last Updated:** February 10, 2026

---

## Overview

This guide covers integrating Enterprise AI Agents with external enterprise systems. The integration layer provides production-ready connectors with fault tolerance, caching, and observability.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Enterprise AI Agents                          │
├─────────────────────────────────────────────────────────────────┤
│                    Integration Layer                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Base Connector                           │  │
│  │  • Circuit Breaker  • Rate Limiting  • Retry Logic        │  │
│  │  • OAuth2 Tokens    • Request Tracing  • Caching          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │ServiceNow│ Workday  │Salesforce│ Azure AD │   SAP    │ Jira │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Available Connectors

| Connector | Purpose | Auth Type | Agent Usage |
|-----------|---------|-----------|-------------|
| ServiceNow | ITSM, incidents, CMDB | OAuth2/Basic | IT Ops |
| Workday | HCM, employees, org data | OAuth2 | HR, Recruitment |
| Salesforce | CRM, opportunities, accounts | OAuth2 | Presales |
| Azure AD | Users, groups, identity | OAuth2 | All (Auth) |
| SAP | ERP, materials, vendors | Basic/SAP SSO | Cloud Ops |
| Jira | Issues, projects, sprints | API Token | IT Ops |

---

## ServiceNow Integration

### Configuration

```env
# .env
SERVICENOW_INSTANCE=https://yourcompany.service-now.com
SERVICENOW_USERNAME=integration_user
SERVICENOW_PASSWORD=your_password

# OAuth2 (recommended for production)
SERVICENOW_CLIENT_ID=your_client_id
SERVICENOW_CLIENT_SECRET=your_client_secret
```

### Setup Steps

1. **Create Integration User**
   - Navigate to User Administration > Users
   - Create user with `itil` and `rest_service` roles
   - Enable "Web service access only"

2. **Create OAuth Application** (recommended)
   - Navigate to System OAuth > Application Registry
   - Create new OAuth API endpoint
   - Note Client ID and Secret

3. **Grant Table Access**
   ```
   Tables required:
   - incident (read/write)
   - change_request (read/write)
   - cmdb_ci (read)
   - kb_knowledge (read)
   - sys_user (read)
   ```

### Usage in Agents

```typescript
// IT Ops Agent automatically uses ServiceNow for incidents
const incidents = await serviceNow.searchIncidents({
  priority: 'P1',
  state: 'In Progress',
  assignmentGroup: 'Platform Engineering'
});

// Create incident from agent
await serviceNow.createIncident({
  short_description: 'API Gateway Latency Issue',
  priority: '2',
  category: 'Infrastructure',
  assignment_group: 'Cloud Operations'
});
```

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/api/now/table/incident` | Incident CRUD |
| `/api/now/table/change_request` | Change management |
| `/api/now/table/cmdb_ci` | Configuration items |
| `/api/now/table/kb_knowledge` | Knowledge articles |

---

## Workday Integration

### Configuration

```env
# .env
WORKDAY_TENANT=yourcompany
WORKDAY_HOST=https://wd5-impl-services1.workday.com
WORKDAY_CLIENT_ID=your_client_id
WORKDAY_CLIENT_SECRET=your_client_secret
WORKDAY_REFRESH_TOKEN=your_refresh_token
```

### Setup Steps

1. **Create Integration System User (ISU)**
   - Security > Integration System Users
   - Grant appropriate domain permissions

2. **Register API Client**
   - Register Workday > API Clients
   - Configure OAuth2 scopes
   - Generate refresh token

3. **Configure Security**
   ```
   Required Domain Permissions:
   - Worker Data: Public Worker Reports
   - Staffing: View Worker Profile
   - Organization: View Organization
   - Time Off: View Time Off
   ```

### Usage in Agents

```typescript
// HR Agent uses Workday for employee data
const employee = await workday.getEmployee('EMP001');

// Get organization hierarchy
const org = await workday.getOrganizationHierarchy('ORG-IT');

// Get time-off balances
const balances = await workday.getTimeOffBalances('EMP001');
```

### Web Services Used

| Service | Purpose |
|---------|---------|
| Human_Resources | Worker data, positions |
| Staffing | Hiring, terminations |
| Time_Tracking | Time-off balances |
| Recruiting | Candidates, requisitions |

---

## Salesforce Integration

### Configuration

```env
# .env
SALESFORCE_INSTANCE_URL=https://yourcompany.my.salesforce.com
SALESFORCE_CLIENT_ID=consumer_key
SALESFORCE_CLIENT_SECRET=consumer_secret
SALESFORCE_USERNAME=integration@yourcompany.com
SALESFORCE_PASSWORD=password
SALESFORCE_SECURITY_TOKEN=security_token
```

### Setup Steps

1. **Create Connected App**
   - Setup > App Manager > New Connected App
   - Enable OAuth Settings
   - Select required scopes: `api`, `refresh_token`

2. **Create Integration User**
   - Create user with API-only license
   - Assign appropriate Profile/Permission Set

3. **Configure IP Restrictions**
   - Add integration server IPs to trusted ranges

### Usage in Agents

```typescript
// Presales Agent uses Salesforce for opportunities
const opportunities = await salesforce.searchOpportunities({
  stage: 'Proposal',
  minAmount: 1000000,
  closeDateFrom: '2026-01-01'
});

// Get pipeline summary
const pipeline = await salesforce.getPipelineSummary();
```

### Objects Accessed

| Object | Purpose |
|--------|---------|
| Opportunity | Sales pipeline |
| Account | Customer data |
| Contact | Customer contacts |
| Lead | Sales leads |

---

## Azure AD (Microsoft Entra ID) Integration

### Configuration

```env
# .env
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=application-id
AZURE_CLIENT_SECRET=client-secret
```

### Setup Steps

1. **Register Application**
   - Azure Portal > App registrations > New registration
   - Note Application (client) ID

2. **Create Client Secret**
   - Certificates & secrets > New client secret
   - Note the secret value (shown only once)

3. **Configure API Permissions**
   ```
   Microsoft Graph permissions (Application):
   - User.Read.All
   - Group.Read.All
   - Directory.Read.All
   - AuditLog.Read.All (optional, for sign-in logs)
   ```

4. **Grant Admin Consent**
   - API permissions > Grant admin consent

### Usage in Agents

```typescript
// All agents can use Azure AD for user lookup
const user = await azureAD.getUser('user@company.com');

// Get user's group memberships
const groups = await azureAD.getUserGroups('user-id');

// Search users by department
const users = await azureAD.searchUsers({
  department: 'Engineering',
  accountEnabled: true
});
```

### Graph API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/v1.0/users` | User management |
| `/v1.0/groups` | Group management |
| `/v1.0/auditLogs/signIns` | Sign-in activity |

---

## SAP Integration

### Configuration

```env
# .env
SAP_HOST=https://sap.yourcompany.com:443
SAP_CLIENT=100
SAP_USERNAME=RFC_USER
SAP_PASSWORD=password
```

### Setup Steps

1. **Create RFC User**
   - Transaction SU01 > Create technical user
   - Assign required authorization objects

2. **Enable OData Services**
   - Transaction /IWFND/MAINT_SERVICE
   - Activate required services

3. **Configure Network**
   - Ensure HTTPS access to SAP Gateway
   - Configure SAP Web Dispatcher if needed

### Usage in Agents

```typescript
// Cloud Ops Agent uses SAP for procurement data
const materials = await sap.searchMaterials({
  materialType: 'IT',
  plant: 'US01'
});

// Get purchase orders
const orders = await sap.getPurchaseOrders({
  vendor: 'VENDOR001',
  status: 'Open'
});
```

### OData Services

| Service | Purpose |
|---------|---------|
| API_PRODUCT_SRV | Material master |
| API_BUSINESS_PARTNER | Vendors, customers |
| API_PURCHASEORDER_PROCESS_SRV | Purchase orders |

---

## Jira Integration

### Configuration

```env
# .env
JIRA_HOST=https://yourcompany.atlassian.net
JIRA_EMAIL=integration@yourcompany.com
JIRA_API_TOKEN=your_api_token
```

### Setup Steps

1. **Generate API Token**
   - Atlassian Account > Security > API tokens
   - Create new token

2. **Grant Project Access**
   - Project Settings > People
   - Add integration user with appropriate role

### Usage in Agents

```typescript
// IT Ops Agent uses Jira for issue tracking
const issues = await jira.searchIssues({
  project: 'OPS',
  status: 'Open',
  labels: ['incident']
});

// Create issue from incident
await jira.createIssue({
  project: 'OPS',
  issueType: 'Bug',
  summary: 'Production latency issue',
  priority: 'High'
});
```

### REST Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/rest/api/3/issue` | Issue CRUD |
| `/rest/api/3/search` | JQL search |
| `/rest/api/3/project` | Project info |

---

## Fault Tolerance

### Circuit Breaker

All connectors include circuit breaker protection:

```typescript
const config = {
  circuitBreaker: {
    timeout: 10000,           // 10 second timeout
    errorThresholdPercentage: 50,  // Open after 50% failures
    resetTimeout: 30000,      // Try again after 30 seconds
    volumeThreshold: 10       // Minimum 10 requests before tripping
  }
};
```

**States:**
- **Closed**: Normal operation
- **Open**: All requests fail fast
- **Half-Open**: Testing if service recovered

### Rate Limiting

```typescript
const config = {
  rateLimit: {
    points: 100,      // 100 requests
    duration: 60,     // Per 60 seconds
    blockDuration: 60 // Block for 60 seconds if exceeded
  }
};
```

### Retry Logic

Automatic retries with exponential backoff:

```typescript
const config = {
  retries: 3,              // Max 3 retries
  retryDelay: 1000,        // Initial delay 1 second
  retryMultiplier: 2       // Double delay each retry
};
```

---

## Caching

### Cache Configuration

```typescript
// Cache service with Redis (production) or memory (development)
const cache = new CacheService({
  redisUrl: process.env.REDIS_URL,
  prefix: 'ea:',
  disableRedis: false
});

// Cache expensive queries
const employees = await cache.cached(
  'workday:employees:engineering',
  () => workday.searchEmployees({ department: 'Engineering' }),
  { ttl: 300 }  // 5 minute TTL
);
```

### Default TTLs

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| User lookup | 5 min | Frequent access, rarely changes |
| Incident list | 1 min | Time-sensitive |
| Organization data | 15 min | Rarely changes |
| Static config | 1 hour | Very stable |

---

## Monitoring

### Health Checks

```typescript
// Create integration health check
const serviceNowCheck = HealthChecker.createIntegrationCheck(
  'servicenow',
  () => serviceNow.testConnection()
);

healthChecker.registerCheck('servicenow', serviceNowCheck);
```

### Metrics

Automatically collected per connector:

```prometheus
# Request counts
integration_requests_total{connector="servicenow",operation="searchIncidents",status="success"} 150
integration_requests_total{connector="servicenow",operation="searchIncidents",status="error"} 3

# Latency
integration_request_duration_seconds{connector="servicenow",operation="searchIncidents"} 0.45
```

### Audit Logging

All integration access is logged:

```typescript
await auditLogger.logIntegrationAccess(
  'servicenow',
  'searchIncidents',
  { userId: 'user@company.com', sessionId: 'session-123' },
  { query: { priority: 'P1' }, resultCount: 15 }
);
```

---

## Security Considerations

### Credential Storage

- **Never** store credentials in code
- Use environment variables or secrets manager
- Rotate credentials regularly

### Network Security

- Use TLS 1.2+ for all connections
- Restrict outbound IPs where possible
- Use VPN/private link for sensitive systems

### Access Control

- Create dedicated integration users
- Grant minimum required permissions
- Enable audit logging on target systems

### Data Handling

- Minimize data retrieved
- Don't cache sensitive data
- Mask PII in logs

---

## Troubleshooting

### Connection Failed

```bash
# Check network connectivity
curl -v https://yourcompany.service-now.com/api/now/table/incident?sysparm_limit=1

# Verify credentials
# Test OAuth token generation manually
```

### Circuit Breaker Open

```bash
# Check connector health
curl http://localhost:3001/ready | jq '.details.checks[] | select(.name == "servicenow")'

# Wait for reset timeout (30 seconds default)
```

### Rate Limited

```bash
# Check rate limit headers in response
# Reduce request frequency
# Implement request batching
```

### Slow Responses

```bash
# Check latency metrics
curl http://localhost:3001/metrics | grep integration_request_duration

# Enable caching for expensive queries
# Optimize API queries (pagination, field selection)
```

---

## Adding New Integrations

### 1. Create Connector Class

```typescript
// packages/integration-layer/src/connectors/my-connector.ts
import { BaseConnector } from './base-connector.js';

export class MyConnector extends BaseConnector {
  constructor(config: IntegrationConfig) {
    super('MySystem', config);
  }

  async getData(query: string): Promise<MyData> {
    return this.execute<MyData>(
      () => this.client.get(`/api/data?q=${query}`),
      `getData(${query})`
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.execute(() => this.client.get('/api/health'), 'testConnection');
      return true;
    } catch {
      return false;
    }
  }
}
```

### 2. Add Configuration

```typescript
// packages/integration-layer/src/config.ts
export const INTEGRATION_ENDPOINTS = {
  // ... existing
  mySystem: {
    data: '/api/data',
    health: '/api/health'
  }
};
```

### 3. Export Connector

```typescript
// packages/integration-layer/src/connectors/index.ts
export { MyConnector } from './my-connector.js';
```

### 4. Add Environment Variables

```env
# config/production.env.example
MY_SYSTEM_HOST=https://mysystem.example.com
MY_SYSTEM_API_KEY=your_api_key
```

### 5. Create Health Check

```typescript
healthChecker.registerCheck(
  'my-system',
  HealthChecker.createIntegrationCheck('my-system', () => myConnector.testConnection())
);
```

---

**Document maintained by:** Enterprise AI Team
**Last updated:** February 10, 2026
