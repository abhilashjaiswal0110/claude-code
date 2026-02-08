---
description: Incident response, monitoring setup, automation scripts, and operations documentation
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# IT Operations Agent Command

Incident response, monitoring setup, automation scripts, and operations documentation.

## Usage

```bash
/it-ops <query> [--mode <mode>] [--context <details>]
```

## Modes

- `incident` - Incident response playbooks (default)
- `monitoring` - Monitoring and alerting setup
- `automation` - Automation scripts and workflows
- `documentation` - Runbooks and operational docs

## Examples

```bash
/it-ops Database performance degradation incident response
/it-ops --mode monitoring Set up APM for Node.js microservices
/it-ops --mode automation Automated backup and rotation script
/it-ops --mode documentation Kubernetes cluster runbook
```

## Output

- Console: Operational guidance
- JSON: `agents/it-operations-agent/output/it-ops-{mode}-{timestamp}.json`
- Includes: SRE best practices, automation code, escalation paths

## Chain with

- `/cloud-ops` → Cloud-specific operations
- `/sustainability` → Green IT automation
- `/hr` → On-call policies and rotations
