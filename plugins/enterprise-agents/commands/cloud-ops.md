---
description: Multi-cloud operations, FinOps, SRE practices, cost optimization, and cloud architecture review
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# Cloud Operations Agent Command

Multi-cloud operations, FinOps, SRE practices, cost optimization, and cloud architecture review.

## Usage

```bash
/cloud-ops <query> [--mode <mode>] [--context <details>]
```

## Modes

- `cost-optimization` - Cloud cost optimization (default)
- `incident-response` - Cloud incident response
- `capacity-planning` - Capacity and scaling planning
- `architecture-review` - Cloud architecture review
- `migration-assessment` - Cloud migration assessment

## Examples

```bash
/cloud-ops AWS monthly cost reduction strategies
/cloud-ops --mode incident-response --context "Multi-region, Kubernetes, microservices" S3 outage recovery plan
/cloud-ops --mode capacity-planning Black Friday traffic surge planning
/cloud-ops --mode migration-assessment On-premise to Azure migration for SAP workloads
```

## Output

- Console: Cloud operations guidance
- JSON: `agents/cloud-ops-agent/output/cloud-ops-{mode}-{timestamp}.json`
- Includes: Analysis, recommendations, cost impact, implementation steps

## Chain with

- `/it-ops` → Hybrid cloud operations
- `/sustainability` → Green cloud optimization
- `/presales` → Cloud solution proposals
