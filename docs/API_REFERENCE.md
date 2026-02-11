# Enterprise AI Agents - API Reference

**Version:** 1.0.0 | **Base URL:** `http://localhost:3001`

---

## Overview

The Enterprise AI Agents API provides RESTful endpoints for interacting with AI agents, managing sessions, and streaming responses via Server-Sent Events (SSE).

### Authentication

| Method | Header | Description |
|--------|--------|-------------|
| API Key | `X-API-Key: <key>` | For service-to-service calls |
| JWT | `Authorization: Bearer <token>` | For user sessions |

### Content Types

- Request: `application/json`
- Response: `application/json` or `text/event-stream` (SSE)

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 100 requests | 60 seconds |
| `/api/chat` | 20 requests | 60 seconds |

---

## Endpoints

### Health & Status

#### GET /health

Basic health check.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600000
}
```

---

#### GET /ready

Readiness probe with dependency checks.

**Response:**
```json
{
  "ready": true,
  "details": {
    "status": "healthy",
    "timestamp": "2026-02-10T14:30:00Z",
    "version": "1.0.0",
    "uptime": 3600000,
    "checks": [
      { "name": "memory", "status": "healthy", "latencyMs": 1 },
      { "name": "eventLoop", "status": "healthy", "latencyMs": 2 },
      { "name": "redis", "status": "healthy", "latencyMs": 5 },
      { "name": "anthropic", "status": "healthy", "latencyMs": 150 }
    ]
  }
}
```

---

#### GET /live

Liveness probe.

**Response:**
```json
{
  "alive": true
}
```

---

#### GET /metrics

Prometheus-compatible metrics.

**Response:** `text/plain`
```prometheus
# HELP agent_executions_total Total agent executions
# TYPE agent_executions_total counter
agent_executions_total{agent="hr",mode="policy",status="success"} 150
agent_executions_total{agent="hr",mode="policy",status="error"} 3

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="POST",path="/api/chat",le="0.1"} 45
http_request_duration_seconds_bucket{method="POST",path="/api/chat",le="0.5"} 120
```

---

### Agents

#### GET /api/agents

List all available agents.

**Response:**
```json
[
  {
    "id": "hr",
    "name": "HR Agent",
    "description": "Employee relations, policy guidance, and onboarding support",
    "category": "Human Resources",
    "modes": [
      { "id": "policy", "label": "Policy Lookup", "description": "Answer policy questions" },
      { "id": "benefits", "label": "Benefits", "description": "Explain benefit options" },
      { "id": "engagement", "label": "Engagement", "description": "Survey analysis" },
      { "id": "onboarding", "label": "Onboarding", "description": "New hire plans" },
      { "id": "exit-interview", "label": "Exit Interview", "description": "Exit trend analysis" }
    ]
  },
  {
    "id": "it-ops",
    "name": "IT Operations Agent",
    "description": "Incident response, runbooks, and infrastructure automation",
    "category": "IT Operations",
    "modes": [
      { "id": "incident", "label": "Incident", "description": "Triage and response" },
      { "id": "kb-search", "label": "KB Search", "description": "Knowledge base lookup" },
      { "id": "root-cause", "label": "Root Cause", "description": "RCA analysis" },
      { "id": "status-report", "label": "Status Report", "description": "Generate reports" },
      { "id": "runbook", "label": "Runbook", "description": "Create runbooks" }
    ]
  }
  // ... 8 more agents
]
```

---

#### GET /api/agents/:id

Get details for a specific agent.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | string | Agent identifier (e.g., "hr", "it-ops") |

**Response:**
```json
{
  "id": "hr",
  "name": "HR Agent",
  "description": "Employee relations, policy guidance, and onboarding support",
  "category": "Human Resources",
  "modes": [...],
  "capabilities": [
    "Policy lookup from knowledge base",
    "Benefits eligibility calculation",
    "Onboarding plan generation",
    "Engagement survey analysis"
  ],
  "budgetPerExecution": {
    "max": 2.25,
    "currency": "USD"
  }
}
```

---

### Sessions

#### POST /api/sessions

Create a new chat session.

**Request:**
```json
{
  "agentId": "hr",
  "mode": "policy"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "agentId": "hr",
  "mode": "policy",
  "createdAt": "2026-02-10T14:30:00Z",
  "updatedAt": "2026-02-10T14:30:00Z",
  "messages": [],
  "context": {}
}
```

---

#### GET /api/sessions/:id

Get session details.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "agentId": "hr",
  "mode": "policy",
  "createdAt": "2026-02-10T14:30:00Z",
  "updatedAt": "2026-02-10T14:35:00Z",
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "What is the remote work policy?",
      "timestamp": "2026-02-10T14:31:00Z"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "Our remote work policy allows...",
      "timestamp": "2026-02-10T14:31:30Z",
      "toolCalls": [
        { "name": "searchPolicies", "status": "completed" }
      ]
    }
  ]
}
```

---

#### DELETE /api/sessions/:id

Delete a session.

**Response:**
```json
{
  "success": true,
  "message": "Session deleted"
}
```

---

### Chat

#### POST /api/chat/:sessionId/message

Send a message and receive streaming response.

**Request:**
```json
{
  "content": "What is the remote work policy for California employees?",
  "mode": "policy",
  "files": ["file-uuid-1", "file-uuid-2"]
}
```

**Response:** Server-Sent Events (SSE)

```
event: stage
data: {"type": "stage", "name": "Classification", "index": 0}

event: thinking
data: {"type": "thinking", "content": "Analyzing the question..."}

event: tool_call
data: {"type": "tool_call", "tool": "searchPolicies", "status": "running"}

event: tool_call
data: {"type": "tool_call", "tool": "searchPolicies", "status": "completed"}

event: content
data: {"type": "content", "content": "The remote work policy for California employees includes..."}

event: content
data: {"type": "content", "content": " special provisions for medical accommodations..."}

event: stage
data: {"type": "stage", "name": "Compliance Check", "index": 3}

event: done
data: {"type": "done"}
```

**SSE Event Types:**

| Event | Description | Data Fields |
|-------|-------------|-------------|
| `stage` | Pipeline stage started | `name`, `index` |
| `thinking` | Agent reasoning (if enabled) | `content` |
| `tool_call` | Tool execution status | `tool`, `status`, `result` |
| `content` | Response text chunk | `content` |
| `error` | Error occurred | `message` |
| `done` | Response complete | - |

---

### File Upload

#### POST /api/upload

Upload a file for context.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Document (PDF, TXT, DOCX, etc.) |

**Response:**
```json
{
  "id": "file-550e8400-e29b-41d4",
  "name": "policy-doc.pdf",
  "originalName": "Remote Work Policy 2025.pdf",
  "path": "/uploads/file-550e8400-e29b-41d4.pdf",
  "type": "application/pdf",
  "size": 245678,
  "uploadedAt": "2026-02-10T14:30:00Z"
}
```

**Supported Types:**
- PDF (`.pdf`)
- Text (`.txt`, `.md`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- Images (`.png`, `.jpg`, `.gif`)

**Size Limit:** 10 MB

---

### Integrations

#### GET /api/integrations

List configured integrations and status.

**Response:**
```json
{
  "integrations": [
    {
      "id": "servicenow",
      "name": "ServiceNow",
      "status": "healthy",
      "latencyMs": 45,
      "lastCheck": "2026-02-10T14:30:00Z"
    },
    {
      "id": "workday",
      "name": "Workday",
      "status": "placeholder",
      "latencyMs": null,
      "lastCheck": null
    },
    {
      "id": "salesforce",
      "name": "Salesforce",
      "status": "degraded",
      "latencyMs": 850,
      "lastCheck": "2026-02-10T14:29:00Z"
    }
  ]
}
```

---

### Workflows

#### POST /api/workflows/:workflowId/execute

Execute a predefined workflow.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `workflowId` | string | Workflow identifier |

**Request:**
```json
{
  "input": "Senior DevOps Engineer",
  "context": {
    "department": "Platform Engineering",
    "location": "London"
  }
}
```

**Response:** SSE stream with multi-agent execution

```
event: workflow_start
data: {"workflow": "recruitment-pipeline", "steps": 7}

event: step_start
data: {"step": 1, "agent": "recruitment", "mode": "jd"}

event: content
data: {"type": "content", "content": "Job Description for Senior DevOps Engineer..."}

event: step_complete
data: {"step": 1, "agent": "recruitment", "mode": "jd", "durationMs": 15000}

event: step_start
data: {"step": 2, "agent": "recruitment", "mode": "screening"}

// ... more steps

event: workflow_complete
data: {"workflow": "recruitment-pipeline", "totalDurationMs": 120000, "outputFiles": [...]}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Bad Request",
  "message": "Detailed error description",
  "requestId": "req-550e8400-e29b-41d4",
  "timestamp": "2026-02-10T14:30:00Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid auth |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Temporary outage |

### Common Errors

#### Invalid Agent ID
```json
{
  "error": "Not Found",
  "message": "Agent 'invalid-agent' not found. Available agents: hr, it-ops, marketing, ...",
  "requestId": "req-123"
}
```

#### Invalid Mode
```json
{
  "error": "Bad Request",
  "message": "Mode 'invalid-mode' not valid for agent 'hr'. Valid modes: policy, benefits, engagement, onboarding, exit-interview",
  "requestId": "req-124"
}
```

#### Rate Limit Exceeded
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60,
  "requestId": "req-125"
}
```

---

## WebSocket Alternative

For bidirectional communication, WebSocket is available:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'create_session',
    agentId: 'hr',
    mode: 'policy'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

// Send message
ws.send(JSON.stringify({
  type: 'message',
  sessionId: 'session-uuid',
  content: 'What is the PTO policy?'
}));
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { EnterpriseAgentsClient } from '@enterprise-agents/client';

const client = new EnterpriseAgentsClient({
  baseUrl: 'http://localhost:3001',
  apiKey: process.env.API_KEY
});

// Create session
const session = await client.createSession('hr', 'policy');

// Send message with streaming
const stream = client.chat(session.id, 'What is the remote work policy?');

for await (const event of stream) {
  if (event.type === 'content') {
    process.stdout.write(event.content);
  }
}
```

### Python

```python
from enterprise_agents import Client

client = Client(
    base_url="http://localhost:3001",
    api_key=os.environ["API_KEY"]
)

# Create session
session = client.create_session(agent_id="hr", mode="policy")

# Send message with streaming
for event in client.chat(session.id, "What is the remote work policy?"):
    if event["type"] == "content":
        print(event["content"], end="")
```

### cURL

```bash
# Create session
SESSION=$(curl -s -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"agentId": "hr", "mode": "policy"}' | jq -r '.id')

# Send message (SSE)
curl -N -X POST "http://localhost:3001/api/chat/$SESSION/message" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"content": "What is the remote work policy?"}'
```

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
```
GET /api/openapi.json
GET /api/docs  # Swagger UI
```

---

**Document maintained by:** Enterprise AI Team
**Last updated:** February 10, 2026
