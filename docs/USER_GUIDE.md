# Enterprise AI Agents - User Guide

**Version:** 1.0.0 | **Last Updated:** February 10, 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Available Agents](#available-agents)
4. [Using the API Server](#using-the-api-server)
5. [Using the Web UI](#using-the-web-ui)
6. [Using CLI Commands](#using-cli-commands)
7. [Working with Synthetic Data](#working-with-synthetic-data)
8. [Workflows & Orchestration](#workflows--orchestration)
9. [Integration Points](#integration-points)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Introduction

Enterprise AI Agents is a suite of 10 production-ready AI assistants built on the Claude Agent SDK, designed to augment enterprise workflows across HR, IT, Sales, Marketing, and more.

### Key Features

| Feature | Description |
|---------|-------------|
| **10 Specialized Agents** | Domain-specific AI for HR, IT Ops, Sales, Marketing, Learning, Recruitment, Cloud, Sustainability, Accessibility, LinkedIn |
| **Multi-Stage Pipelines** | Research → Generation → Review workflow with quality controls |
| **Enterprise Integrations** | Ready-to-connect with ServiceNow, Workday, Salesforce, Azure AD, SAP, Jira |
| **Real-Time Streaming** | SSE-based response streaming for immediate feedback |
| **Compliance Built-In** | GDPR, bias detection, audit logging |
| **Workflow Orchestration** | Chain multiple agents for complex multi-step tasks |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interfaces                           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│   │  Web UI  │  │ API/REST │  │ CLI/Slash│                 │
│   │  (React) │  │  (SSE)   │  │ Commands │                 │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
├────────┴─────────────┴─────────────┴────────────────────────┤
│                      API Server                              │
│   • Session Management  • Rate Limiting  • Authentication   │
├─────────────────────────────────────────────────────────────┤
│                    Agent Layer (10 Agents)                   │
│   HR │ IT Ops │ Marketing │ Presales │ Recruitment │ ...   │
├─────────────────────────────────────────────────────────────┤
│                    Shared Core Libraries                     │
│   @enterprise-agents/core │ @enterprise-agents/prompts      │
├─────────────────────────────────────────────────────────────┤
│                  Integration Layer                           │
│   ServiceNow │ Workday │ Salesforce │ Azure AD │ SAP │ Jira │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Anthropic API Key** from [console.anthropic.com](https://console.anthropic.com/)
- **Redis** (optional, for production caching)

### Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone <repository-url>
cd claude-code

# 2. Install dependencies
npm install

# 3. Configure your API key
cp config/production.env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the API server
cd packages/api-server
npm run build && npm start

# 5. Open Web UI (optional)
cd ../web-ui
npm run build && npm run preview
```

### Verify Installation

```bash
# Test API health
curl http://localhost:3001/health

# List available agents
curl http://localhost:3001/api/agents
```

---

## Available Agents

### Quick Reference

| Agent | Command | Primary Use Case | Key Modes |
|-------|---------|------------------|-----------|
| **HR** | `/hr` | Policy queries, onboarding | policy, benefits, onboarding |
| **IT Operations** | `/it-ops` | Incident triage, runbooks | incident, root-cause, runbook |
| **Marketing** | `/marketing` | Content creation | blog, social, campaign |
| **Presales** | `/presales` | Proposals, RFPs | proposal, rfp, competitor |
| **Recruitment** | `/recruitment` | Hiring support | jd, screening, interview |
| **Learning** | `/learning` | Training plans | skill-gap, learning-path |
| **LinkedIn** | `/linkedin` | Professional content | auto |
| **Sustainability** | `/sustainability` | ESG, carbon footprint | carbon-footprint, esg-compliance |
| **Accessibility** | `/accessibility` | WCAG compliance | wcag-audit, remediation-plan |
| **Cloud Ops** | `/cloud-ops` | FinOps, architecture | cost-optimization, architecture-review |

### Agent Details

#### HR Agent

**Purpose:** Employee relations, policy guidance, and onboarding support

**Modes:**
| Mode | Description | Example |
|------|-------------|---------|
| `policy` | Policy lookup and guidance | "What is the remote work policy?" |
| `benefits` | Benefits explanation | "Explain health insurance options" |
| `engagement` | Survey analysis | "Analyze Q4 engagement results" |
| `onboarding` | New hire plans | "Onboarding plan for cloud engineer" |
| `exit-interview` | Exit trend analysis | "Summarize exit interview trends" |

**Sample Usage:**
```bash
# CLI
npm start "What is the PTO policy?" --mode policy

# API
POST /api/chat/{sessionId}/message
{"content": "What is the remote work policy?", "mode": "policy"}
```

---

#### IT Operations Agent

**Purpose:** Infrastructure management, incident response, and automation

**Modes:**
| Mode | Description | Example |
|------|-------------|---------|
| `incident` | Incident triage | "API returning 503 errors" |
| `kb-search` | Knowledge base search | "Search for known DB issues" |
| `root-cause` | RCA analysis | "Why did the outage occur?" |
| `status-report` | Status generation | "Production status report" |
| `runbook` | Runbook creation | "Database failover runbook" |

**Incident Severity Levels:**
| Level | Name | Response SLA | Resolution SLA |
|-------|------|--------------|----------------|
| P1 | Critical | 15 min | 4 hours |
| P2 | High | 30 min | 8 hours |
| P3 | Medium | 2 hours | 24 hours |
| P4 | Low | 4 hours | 48 hours |

---

#### Marketing Agent

**Purpose:** Enterprise marketing content generation

**Modes:**
| Mode | Description | Output |
|------|-------------|--------|
| `blog` | Technical blog posts | 2,500+ word SEO-optimized article |
| `social` | Social media calendar | Multi-platform content |
| `campaign` | Campaign briefs | Full messaging framework |
| `press-release` | Press releases | AP-style announcement |
| `newsletter` | Email newsletters | HTML-ready content |

---

#### Recruitment Agent

**Purpose:** Hiring support with bias detection and compliance

**Modes:**
| Mode | Description | Features |
|------|-------------|----------|
| `jd` | Job descriptions | Inclusive language, bias-free |
| `screening` | Screening frameworks | Skills-based criteria |
| `interview` | Interview questions | Structured, behavioral |
| `comparison` | Candidate comparison | Objective matrices |
| `offer` | Offer letters | Template with benchmarks |

**Built-in Compliance:**
- ✓ Gender-neutral language validation
- ✓ Age-indicative term detection
- ✓ Equal opportunity statement inclusion
- ✓ GDPR-compliant data handling

---

#### Presales Agent

**Purpose:** Proposal generation, competitive analysis, deal support

**Modes:**
| Mode | Description |
|------|-------------|
| `proposal` | Full technical proposals |
| `competitor` | Competitive intelligence |
| `rfp` | RFP response drafting |
| `pitch-deck` | Presentation outlines |
| `win-loss` | Deal pattern analysis |

---

#### Learning & Development Agent

**Purpose:** Training and skill development planning

**Modes:**
| Mode | Description |
|------|-------------|
| `skill-gap` | Skills gap analysis |
| `learning-path` | Personalized learning plans |
| `training` | Course recommendations |
| `assessment` | Competency assessments |
| `team-matrix` | Team skill matrices |

---

#### Sustainability Agent

**Purpose:** IT sustainability, carbon footprint, ESG compliance

**Modes:**
| Mode | Description | Standards |
|------|-------------|-----------|
| `carbon-footprint` | Emissions analysis | GHG Protocol |
| `green-it` | Data center optimization | ISO 50001 |
| `sustainability-report` | ESG reporting | GRI, CDP, TCFD |
| `energy-optimization` | Renewable integration | Science-Based Targets |
| `esg-compliance` | Regulatory assessment | EU CSRD, SEC |

---

#### Accessibility Agent

**Purpose:** Digital accessibility auditing and WCAG compliance

**Modes:**
| Mode | Description | Standards |
|------|-------------|-----------|
| `wcag-audit` | Conformance audit | WCAG 2.1/2.2 |
| `remediation-plan` | Fix roadmap | Prioritized by impact |
| `alt-text` | Alt text generation | Context-aware |
| `aria-review` | WAI-ARIA analysis | Best practices |
| `compliance-report` | VPAT/ACR documentation | Section 508 |

---

#### Cloud Operations Agent

**Purpose:** Multi-cloud operations, FinOps, SRE practices

**Modes:**
| Mode | Description | Framework |
|------|-------------|-----------|
| `cost-optimization` | Cloud spend analysis | FinOps |
| `incident-response` | Postmortem analysis | SRE |
| `capacity-planning` | Scaling strategy | Growth modeling |
| `architecture-review` | Cloud assessment | Well-Architected |
| `migration-assessment` | Migration planning | 6Rs methodology |

---

## Using the API Server

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Health Check
```bash
GET /health
# Response: { "status": "healthy", "version": "1.0.0" }
```

#### List Agents
```bash
GET /api/agents
# Response: Array of agent configurations with modes
```

#### Create Session
```bash
POST /api/sessions
Content-Type: application/json

{
  "agentId": "hr",
  "mode": "policy"
}

# Response: { "id": "session-uuid", "agentId": "hr", "mode": "policy" }
```

#### Send Message (Streaming)
```bash
POST /api/chat/{sessionId}/message
Content-Type: application/json

{
  "content": "What is the remote work policy?",
  "mode": "policy"
}

# Response: Server-Sent Events (SSE) stream
# event: content
# data: {"type": "content", "content": "The remote work policy..."}
```

#### Upload File
```bash
POST /api/upload
Content-Type: multipart/form-data

file=@document.pdf

# Response: { "id": "file-uuid", "name": "document.pdf" }
```

### Authentication

For production, include authentication headers:

```bash
# API Key authentication
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/agents

# JWT authentication
curl -H "Authorization: Bearer <jwt-token>" http://localhost:3001/api/chat/123/message
```

### Rate Limits

| Tier | Requests/Minute | Concurrent Sessions |
|------|-----------------|---------------------|
| Default | 100 | 10 |
| Premium | 500 | 50 |
| Enterprise | Unlimited | Unlimited |

---

## Using the Web UI

### Accessing the UI
```
http://localhost:3000
```

### Features

1. **Agent Selection** - Choose from 10 available agents
2. **Mode Picker** - Select specific mode for each agent
3. **Real-Time Chat** - Streaming responses with typing indicators
4. **File Upload** - Attach documents for context
5. **Session History** - Review previous conversations
6. **Export Options** - Download responses as JSON/Markdown

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Ctrl+N` | New session |
| `Ctrl+L` | Clear chat |
| `Escape` | Cancel current request |

---

## Using CLI Commands

### Via Claude Code Plugin

```bash
# Basic usage
/hr What is the PTO policy?

# With mode
/marketing --mode social Create a post about AI trends

# With context
/recruitment --mode jd --context "Senior role, 5+ years, AI focus" Software Engineer
```

### Direct Agent Execution

```bash
# Navigate to agent
cd agents/hr-agent

# Run with npm
npm start "Your question here"

# With mode
npm start -- --mode benefits "Explain health insurance"

# With additional context
npm start -- --mode onboarding --context "Cloud team" "New engineer"
```

---

## Working with Synthetic Data

### Available Datasets

The `data/synthetic/` directory contains realistic enterprise data for POC demonstrations:

| File | Records | Description |
|------|---------|-------------|
| `employees.json` | 20 | Employee profiles with skills, certifications |
| `incidents.json` | 25 | IT incidents with severity, SLA, resolution |
| `opportunities.json` | 15 | Sales pipeline with stages, amounts |
| `candidates.json` | 12 | Recruitment candidates with history |
| `sustainability-metrics.json` | - | Carbon emissions, ESG scores |
| `cloud-infrastructure.json` | - | AWS/Azure/GCP resources and costs |
| `learning-catalog.json` | - | Courses, paths, certifications |
| `policies.json` | 7 | HR policies with FAQs |

### Using Synthetic Data

The agents automatically use synthetic data when enterprise integrations are not configured. This allows for realistic demonstrations without live system connections.

**Example: Query HR policies**
```bash
/hr What is the remote work policy?
# Uses data/synthetic/policies.json
```

**Example: View incident metrics**
```bash
/it-ops What are our current P1 incidents?
# Uses data/synthetic/incidents.json
```

### Transitioning to Real Data

When ready for production:

1. **Configure integration credentials** in `.env`
2. **Set `ENABLE_SYNTHETIC_DATA=false`**
3. **Verify connectivity** with `npm run test:integrations`

---

## Workflows & Orchestration

### Built-in Workflows

#### Recruitment Pipeline
```bash
/workflow recruitment-pipeline "Senior DevOps Engineer"
```

**Steps:**
1. Job Description (Recruitment Agent)
2. Screening Framework (Recruitment Agent)
3. Interview Questions (Recruitment Agent)
4. Offer Template (Recruitment Agent)
5. Onboarding Plan (HR Agent)
6. IT Provisioning (IT Ops Agent)
7. Learning Path (Learning Agent)

---

#### Content Campaign
```bash
/workflow content-campaign "AI Platform Launch"
```

**Steps:**
1. Research & Strategy (Marketing Agent)
2. Blog Post (Marketing Agent)
3. Social Media (Marketing Agent)
4. LinkedIn Posts (LinkedIn Agent)
5. Press Release (Marketing Agent)
6. Sales Enablement (Presales Agent)

---

#### Incident Postmortem
```bash
/workflow incident-postmortem "Production Outage Feb 10"
```

**Steps:**
1. Incident Analysis (IT Ops Agent)
2. Root Cause Analysis (IT Ops Agent)
3. Runbook Update (IT Ops Agent)
4. Architecture Review (Cloud Ops Agent)
5. Training Recommendations (Learning Agent)

---

### Custom Workflows

Create custom workflows by chaining agents:

```javascript
// Example: Custom workflow configuration
{
  "name": "new-hire-full-cycle",
  "steps": [
    { "agent": "recruitment", "mode": "offer" },
    { "agent": "hr", "mode": "onboarding" },
    { "agent": "it-ops", "mode": "runbook", "input": "provisioning" },
    { "agent": "learning", "mode": "learning-path" }
  ],
  "contextPassing": true
}
```

---

## Integration Points

### Configured Integrations

| System | Purpose | Configuration |
|--------|---------|---------------|
| **ServiceNow** | Incidents, CMDB, KB | `SERVICENOW_*` env vars |
| **Workday** | HR data, employees | `WORKDAY_*` env vars |
| **Salesforce** | CRM, opportunities | `SALESFORCE_*` env vars |
| **Azure AD** | Users, groups, auth | `AZURE_*` env vars |
| **SAP** | Materials, vendors | `SAP_*` env vars |
| **Jira** | Issues, projects | `JIRA_*` env vars |

### Checking Integration Status

```bash
# Health check includes integration status
curl http://localhost:3001/ready

# Response includes:
{
  "integrations": {
    "servicenow": { "status": "healthy", "latencyMs": 45 },
    "workday": { "status": "placeholder", "latencyMs": null },
    ...
  }
}
```

---

## Best Practices

### For Best Results

1. **Be Specific**
   ```
   # Good
   "What is the remote work policy for California employees with medical accommodations?"

   # Less effective
   "remote work policy"
   ```

2. **Use Appropriate Modes**
   ```
   # For job description
   /recruitment --mode jd "Senior Engineer"

   # For interview questions
   /recruitment --mode interview "Senior Engineer"
   ```

3. **Provide Context**
   ```
   /presales --mode proposal --context "Financial services client, $5M budget, 12-month timeline" "Cloud Migration"
   ```

4. **Review All Outputs**
   - AI-generated content requires human review
   - Verify compliance with company policies
   - Check for accuracy before publishing

### Security Considerations

- Never share API keys in prompts
- Review outputs for sensitive information
- Use RBAC for team access control
- Enable audit logging in production

---

## Troubleshooting

### Common Issues

#### "ANTHROPIC_API_KEY not found"
```bash
# Check environment
echo $ANTHROPIC_API_KEY

# Set in .env file
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

#### "Agent timeout"
```bash
# Increase timeout (milliseconds)
AGENT_EXECUTION_TIMEOUT=600000

# Reduce complexity
# Use simpler prompts or break into multiple requests
```

#### "Rate limit exceeded"
```bash
# Wait and retry
# Or increase limits in configuration
RATE_LIMIT_MAX_REQUESTS=200
```

#### "Integration connection failed"
```bash
# Verify credentials
# Check network connectivity
# Review integration logs
npm run logs:integration
```

### Getting Help

- **Documentation:** `/docs` directory
- **Logs:** Check `logs/` directory
- **Health Check:** `curl localhost:3001/health`
- **Support:** enterprise-ai-team@atos.net

---

## FAQ

**Q: Can I use multiple agents in one request?**
A: Use workflows to chain agents, or make sequential API calls passing context between them.

**Q: How much does it cost to run an agent?**
A: Each agent has budget limits (typically $2-5 per execution). Monitor via `/metrics` endpoint.

**Q: Is my data sent to external services?**
A: Prompts and responses pass through the Anthropic API. Enterprise data stays within your configured integrations.

**Q: Can I customize agent prompts?**
A: Yes, modify `src/prompts.ts` in each agent directory. See Development Guide.

**Q: How do I add a new agent?**
A: Copy an existing agent, modify persona/prompts, register with API server. See Development Guide.

**Q: Is there an audit trail?**
A: Yes, all agent executions are logged. Enable `ENABLE_AUDIT_LOGGING=true` for production.

---

**Document maintained by:** Enterprise AI Team
**Last updated:** February 10, 2026
**Version:** 1.0.0
