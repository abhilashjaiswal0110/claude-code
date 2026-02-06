import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class ITOpsAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'it-operations-agent',
    name: 'IT Operations',
    description: 'Incident response, knowledge base search, root cause analysis, status reports, and runbook generation',
    category: 'IT',
    modes: [
      { id: 'incident', label: 'Incident', description: 'Handle and document incidents' },
      { id: 'kb-search', label: 'KB Search', description: 'Search knowledge base articles' },
      { id: 'root-cause', label: 'Root Cause', description: 'Perform root cause analysis' },
      { id: 'status-report', label: 'Status Report', description: 'Generate system status reports' },
      { id: 'runbook', label: 'Runbook', description: 'Create operational runbooks' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    // Stage 1: Triage/Classification
    this.emitStage(onEvent, 0, 'Incident Triage', 'running');
    this.emitThinking(onEvent, `Analyzing incident: ${mode}...\n`);
    await this.delay(500);
    this.emitStage(onEvent, 0, 'Incident Triage', 'completed');

    // Stage 2: Knowledge Retrieval
    this.emitStage(onEvent, 1, 'Knowledge Retrieval', 'running');
    this.emitThinking(onEvent, 'Searching knowledge base and runbooks...\n');
    await this.delay(700);
    this.emitStage(onEvent, 1, 'Knowledge Retrieval', 'completed');

    // Stage 3: Analysis & Generation
    this.emitStage(onEvent, 2, 'Analysis & Report', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 2, 'Analysis & Report', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      incident: `## Incident Response

**Incident:** ${topic}

### Triage Summary

| Field | Value |
|-------|-------|
| Severity | P2 - High |
| Category | Application/Service |
| Status | In Progress |
| Assigned Team | Platform Engineering |

### Initial Assessment
The reported incident appears to be related to service degradation. Based on initial symptoms:

1. **Impact Scope:** Limited to specific service endpoints
2. **Users Affected:** Estimated 15% of active users
3. **Business Impact:** Moderate - workarounds available

### Immediate Actions
1. ✅ Alert acknowledged and triaged
2. ⏳ Engineering team engaged
3. ⏳ Communication sent to stakeholders
4. ⏳ Investigating root cause

### Suggested Remediation
- Check recent deployments and consider rollback if applicable
- Verify dependent services are healthy
- Scale resources if capacity-related
- Enable enhanced logging for diagnosis

${context ? `\n**Additional Context:** ${context}` : ''}`,

      'kb-search': `## Knowledge Base Search Results

**Query:** ${topic}

### Relevant Articles Found

1. **KB-2024-0156: Service Restart Procedures**
   - Relevance: High
   - Summary: Standard procedures for safely restarting production services
   - Last Updated: 2024-01-15

2. **KB-2024-0089: Troubleshooting Connection Issues**
   - Relevance: High
   - Summary: Step-by-step guide for diagnosing connectivity problems
   - Last Updated: 2024-02-01

3. **KB-2023-0445: Monitoring Alert Response Guide**
   - Relevance: Medium
   - Summary: How to respond to various monitoring alerts
   - Last Updated: 2023-11-20

### Recommended Action
Based on your query, start with KB-2024-0156 which covers the most relevant procedures.

${context ? `\n**Search Context:** ${context}` : ''}`,

      'root-cause': `## Root Cause Analysis

**Incident:** ${topic}

### Timeline
| Time | Event |
|------|-------|
| T-30m | Deployment completed |
| T-15m | First user reports received |
| T-0 | Alert triggered |
| T+5m | Incident declared |
| T+45m | Root cause identified |
| T+60m | Resolution implemented |

### Root Cause
**Primary Cause:** Configuration change in recent deployment caused resource exhaustion under specific load patterns.

### Contributing Factors
1. Insufficient load testing for edge cases
2. Missing alerting threshold for memory utilization
3. No automatic scaling policy for affected service

### Prevention Recommendations

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| Critical | Add memory utilization alerts | SRE | 1 week |
| High | Implement auto-scaling | Platform | 2 weeks |
| High | Enhance load testing | QA | 3 weeks |
| Medium | Review deployment procedures | DevOps | 1 month |

${context ? `\n**Analysis Context:** ${context}` : ''}`,

      'status-report': `## IT Operations Status Report

**Period:** Current Week
**Report Date:** ${new Date().toLocaleDateString()}

### Executive Summary
Overall system health is **Good** with minor incidents during the reporting period.

### Incident Summary
| Metric | Count |
|--------|-------|
| Total Incidents | 12 |
| Resolved | 10 |
| Open | 2 |
| MTTR | 45 minutes |

### Service Availability
| Service | Uptime | SLA Target | Status |
|---------|--------|------------|--------|
| API Gateway | 99.95% | 99.9% | ✅ |
| Database | 99.99% | 99.95% | ✅ |
| Web App | 99.87% | 99.9% | ⚠️ |
| Auth Service | 100% | 99.9% | ✅ |

### Highlights
- Successfully completed quarterly security patches
- Implemented new monitoring dashboards
- Reduced alert noise by 30%

### Upcoming Maintenance
- Database upgrade scheduled for next weekend
- Network equipment refresh in 2 weeks

${context ? `\n**Report Context:** ${context}` : ''}`,

      runbook: `## Runbook: ${topic}

### Overview
| Field | Value |
|-------|-------|
| Service | ${topic} |
| Severity | P2 - High |
| On-Call Team | Platform Engineering |
| Last Updated | ${new Date().toLocaleDateString()} |

### Symptoms
- Service response time > 5 seconds
- Error rate exceeds 1%
- Memory utilization > 90%
- CPU utilization sustained > 80%

### Diagnostic Steps
1. **Check service health**
   \`\`\`bash
   kubectl get pods -n production | grep ${topic.toLowerCase().replace(/\s+/g, '-')}
   \`\`\`

2. **Review recent logs**
   \`\`\`bash
   kubectl logs -n production <pod-name> --tail=100
   \`\`\`

3. **Check metrics dashboard**
   - Navigate to Grafana > Service Dashboards
   - Review error rate and latency graphs

### Resolution Steps
1. **If memory issue:**
   - Scale horizontally: \`kubectl scale deployment --replicas=5\`
   - Consider pod restart if memory leak suspected

2. **If deployment issue:**
   - Check recent deployments: \`kubectl rollout history\`
   - Rollback if needed: \`kubectl rollout undo deployment\`

3. **If dependency issue:**
   - Verify upstream services
   - Check database connectivity

### Escalation
If unresolved after 30 minutes, escalate to:
- Primary: Platform Lead
- Secondary: VP Engineering

### Post-Incident
- Update incident ticket with timeline
- Schedule RCA if P1/P2
- Update this runbook with learnings

${context ? `\n**Additional Notes:** ${context}` : ''}`,
    };

    return responses[mode] || responses['incident'];
  }
}
