import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Senior Cloud Architect and FinOps specialist with expertise across AWS, Azure, and GCP.
You help enterprises optimise cloud costs, improve reliability, ensure security compliance,
and plan cloud migrations. You provide specific, actionable recommendations with cost/effort estimates.
Format with clear Markdown, using tables, code examples, and diagrams in text form where helpful.`;

const MODE_PROMPTS: Record<string, string> = {
  'cost-optimization': `${SYSTEM_BASE}

Conduct a cloud cost optimisation analysis. Include:
- Current spend assessment framework (by service/team/region)
- Top optimisation opportunities (ranked by savings potential)
- Right-sizing recommendations
- Reserved Instances / Savings Plans strategy
- Unused resource identification
- FinOps best practices and tooling
- 30/60/90-day savings roadmap with estimated impact`,

  'incident-response': `${SYSTEM_BASE}

Create a cloud incident response plan. Include:
- Incident classification (P1-P4) for cloud events
- Detection and alerting strategy
- Immediate containment playbook
- Investigation and diagnosis steps
- Recovery procedures (including multi-region failover)
- Post-incident review process
- Communication templates for different stakeholders`,

  'capacity-planning': `${SYSTEM_BASE}

Develop a cloud capacity planning framework. Include:
- Current capacity baseline assessment
- Demand forecasting methodology
- Auto-scaling strategy recommendations
- Reserved capacity vs on-demand analysis
- Seasonal/event-driven scaling plans
- Infrastructure as Code patterns
- Cost projection for planned growth`,

  'architecture-review': `${SYSTEM_BASE}

Conduct a Well-Architected Framework review. Assess across 6 pillars:
1. Operational Excellence
2. Security
3. Reliability
4. Performance Efficiency
5. Cost Optimisation
6. Sustainability
For each pillar: current state, gaps identified, priority recommendations, and implementation effort.`,

  'migration-assessment': `${SYSTEM_BASE}

Create a cloud migration assessment and strategy. Include:
- Current state inventory approach (7Rs framework)
- Migration wave planning
- Risk assessment per workload
- Network and connectivity design
- Data migration strategy
- Security and compliance considerations
- TCO comparison (on-prem vs cloud)
- Success metrics and go-live criteria`,
};

export class CloudOpsAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'cloud-ops-agent',
    name: 'Cloud Operations Agent',
    description: 'Cost optimisation, incident response, capacity planning, architecture review, and migration assessment',
    category: 'Cloud',
    modes: [
      { id: 'cost-optimization', label: 'Cost Optimisation', description: 'Cloud spend analysis' },
      { id: 'incident-response', label: 'Incident Response', description: 'Cloud incident playbook' },
      { id: 'capacity-planning', label: 'Capacity Planning', description: 'Infrastructure scaling' },
      { id: 'architecture-review', label: 'Architecture Review', description: 'Well-Architected review' },
      { id: 'migration-assessment', label: 'Migration Assessment', description: 'Cloud migration planning' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Infrastructure Analysis', 'running');
    this.emitThinking(onEvent, `Analysing cloud operations context: ${mode}...\n`);
    this.emitStage(onEvent, 0, 'Infrastructure Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Recommendation Generation', 'running');
    this.emitThinking(onEvent, 'Generating cloud recommendations...\n');

    // Legacy mode ID aliases for backwards compatibility
    const modeAlias: Record<string, string> = {
      'cost-opt': 'cost-optimization',
      'capacity': 'capacity-planning',
      'arch-review': 'architecture-review',
      'migration': 'migration-assessment',
    };
    const resolvedMode = modeAlias[mode] ?? mode;
    const systemPrompt = MODE_PROMPTS[resolvedMode] ?? MODE_PROMPTS['architecture-review'];
    const userMessage = `${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent, 4096, signal);

    this.emitStage(onEvent, 1, 'Recommendation Generation', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
