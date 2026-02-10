# Enterprise AI Agents - Production Deployment Guide

**Version:** 1.0.0
**Date:** February 10, 2026

---

## Quick Start

### Prerequisites

- Node.js 18+ or Docker
- Redis instance
- Anthropic API key
- (Optional) Enterprise integration credentials

### POC Deployment

```bash
# Clone and install
git clone <repository-url>
cd claude-code
npm install

# Configure environment
cp config/production.env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Start API server
cd packages/api-server
npm run build && npm start

# Start Web UI (optional)
cd ../web-ui
npm run build && npm run preview
```

### Docker Deployment

```bash
# Build images
docker-compose -f config/docker-compose.production.yml build

# Start services
docker-compose -f config/docker-compose.production.yml up -d

# Check status
docker-compose -f config/docker-compose.production.yml ps
```

---

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | API server port | `3001` |

### Optional Integration Variables

See `config/production.env.example` for complete list including:
- ServiceNow credentials
- Workday OAuth configuration
- Salesforce Connected App settings
- Azure AD app registration
- SAP connectivity
- Jira API access

---

## Integration Placeholders

The following integrations have placeholder implementations. To enable real data feeds:

### ServiceNow

1. Create integration user in ServiceNow instance
2. Configure OAuth2 application
3. Set environment variables:
   ```
   SERVICENOW_INSTANCE=https://yourcompany.service-now.com
   SERVICENOW_CLIENT_ID=<client_id>
   SERVICENOW_CLIENT_SECRET=<client_secret>
   ```

### Workday

1. Create Integration System User (ISU)
2. Configure API Client
3. Set environment variables:
   ```
   WORKDAY_TENANT=yourcompany
   WORKDAY_CLIENT_ID=<client_id>
   WORKDAY_CLIENT_SECRET=<client_secret>
   WORKDAY_REFRESH_TOKEN=<refresh_token>
   ```

### Salesforce

1. Create Connected App in Setup
2. Configure OAuth scopes
3. Set environment variables:
   ```
   SALESFORCE_INSTANCE_URL=https://yourcompany.my.salesforce.com
   SALESFORCE_CLIENT_ID=<consumer_key>
   SALESFORCE_CLIENT_SECRET=<consumer_secret>
   ```

### Azure AD

1. Register application in Azure Portal
2. Configure API permissions (Microsoft Graph)
3. Set environment variables:
   ```
   AZURE_TENANT_ID=<tenant_id>
   AZURE_CLIENT_ID=<application_id>
   AZURE_CLIENT_SECRET=<client_secret>
   ```

---

## Synthetic Data

For POC demonstrations, synthetic data is provided in:

```
data/synthetic/
├── employees.json        # 20 sample employees
├── incidents.json        # 25 IT incidents
├── opportunities.json    # 15 sales opportunities
├── candidates.json       # 12 recruitment candidates
├── sustainability-metrics.json
├── cloud-infrastructure.json
├── learning-catalog.json
└── policies.json
```

**Important:** Replace synthetic data with real integrations before production use.

---

## API Endpoints

### Health & Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/ready` | GET | Readiness probe |
| `/metrics` | GET | Prometheus metrics |

### Agents

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all agents |
| `/api/agents/:id` | GET | Get agent details |

### Sessions & Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | POST | Create new session |
| `/api/chat/:sessionId/message` | POST | Send message (SSE) |
| `/api/upload` | POST | Upload file |

---

## Monitoring

### Metrics

Prometheus metrics available at `/metrics`:

- `agent_executions_total` - Total agent executions by agent/mode/status
- `agent_execution_duration_seconds` - Execution duration histogram
- `http_requests_total` - HTTP request counter
- `http_request_duration_seconds` - Request duration histogram

### Logging

JSON-formatted logs include:
- Request ID for tracing
- User identification
- Agent/mode context
- Execution duration
- Error details

### Health Checks

- **Liveness**: `/live` - Application running
- **Readiness**: `/ready` - Ready to serve traffic

---

## Security Considerations

### Before Production

1. **Replace JWT Secret**: Generate cryptographically secure secret
2. **Enable TLS**: Configure HTTPS-only access
3. **Configure CORS**: Restrict allowed origins
4. **Enable Rate Limiting**: Adjust limits for expected load
5. **Set Up WAF**: Configure web application firewall rules

### Ongoing

- Rotate API keys and secrets quarterly
- Monitor security logs for anomalies
- Apply security patches promptly
- Conduct periodic penetration testing

---

## Troubleshooting

### Common Issues

**Issue:** Agent execution timeout
- Check Anthropic API connectivity
- Verify API key is valid
- Review budget limits

**Issue:** Integration failures
- Verify credentials are correct
- Check network connectivity to external services
- Review rate limit status

**Issue:** High memory usage
- Monitor cache size
- Check for session leaks
- Review log retention

### Getting Help

- Review logs at `/var/log/enterprise-agents/`
- Check metrics at `/metrics`
- Contact: enterprise-ai-team@atos.net

---

## Support

For production support:
- **L1/L2**: Service Desk (standard ITSM process)
- **L3**: Enterprise AI Team
- **Emergency**: On-call rotation via PagerDuty

---

**Document maintained by:** Enterprise AI Team
**Last updated:** February 10, 2026
