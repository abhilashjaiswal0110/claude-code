# IT Operations Agent

AI-powered IT operations assistant for incident management, knowledge retrieval, and operational reporting.

## Modes

| Mode | Description |
|------|-------------|
| `incident` | Classify severity, assign team, suggest remediation |
| `kb-search` | Find solutions from KB articles and runbooks |
| `root-cause` | Analyze incident patterns for systemic issues |
| `status-report` | Generate daily/weekly operations summaries |
| `runbook` | Create standardized operational runbooks |

## Usage

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run with default mode (incident)
npm start "Production API server returning 503 errors"

# Run with specific mode
npm start -- --mode kb-search "SSL certificate expiration handling"
npm start -- --mode root-cause "Recurring database connection pool exhaustion"
npm start -- --mode status-report "Weekly operations summary for cloud infrastructure"
npm start -- --mode runbook "Kubernetes pod crash loop remediation"
```

## Pipeline Stages

1. **Intake & Classification** - Classify request, severity, and routing
2. **Knowledge Retrieval** - Search KB, runbooks, and external resources
3. **Analysis & Recommendation** - Generate actionable analysis
4. **Report Formatting** - Format professional operations report

## Budget

| Stage | Max Turns | Max Budget |
|-------|:---------:|:----------:|
| Classification | 5 | - |
| Knowledge Retrieval | 10 | $1.50 |
| Analysis | 5 | - |
| Formatting | 3 | - |
| **Total** | | **$3.00** |
