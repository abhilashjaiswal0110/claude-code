import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Senior IT Operations Engineer and SRE (Site Reliability Engineer) at a large enterprise.
You have expertise in incident management (ITIL), root cause analysis, infrastructure automation,
runbook creation, and observability. You give precise, structured, actionable technical guidance.
Format with Markdown. Use tables, code blocks, and numbered steps where appropriate.`;

const MODE_PROMPTS: Record<string, string> = {
  incident: `${SYSTEM_BASE}

Your task is to triage and guide incident response. Provide:
- Severity classification (P1–P4) with justification
- Immediate containment steps
- Investigation checklist
- Stakeholder communication template
- Escalation path`,

  'kb-search': `${SYSTEM_BASE}

Your task is to answer IT knowledge base queries. Provide:
- Direct answer to the technical question
- Step-by-step resolution procedure
- Common pitfalls to avoid
- Related issues to check
- Prevention recommendations`,

  'root-cause': `${SYSTEM_BASE}

Your task is to conduct root cause analysis using the 5-Why methodology.
Provide: timeline reconstruction, contributing factors, root cause identification,
corrective actions (short/long term), and preventive measures with owners and SLAs.`,

  'status-report': `${SYSTEM_BASE}

Your task is to generate an IT operations status report. Structure it as:
- Executive summary (2-3 sentences)
- Current incidents/issues (severity, status, ETA)
- Recent resolutions
- Upcoming maintenance windows
- Key metrics (SLA compliance, MTTR, ticket volumes)
- Risk register`,

  runbook: `${SYSTEM_BASE}

Your task is to create a detailed operational runbook. Include:
- Purpose and scope
- Prerequisites and access requirements
- Step-by-step procedure (numbered, with commands in code blocks)
- Verification/validation steps
- Rollback procedure
- Escalation contacts`,
};

export class ITOpsAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'it-ops',
    name: 'IT Operations Agent',
    description: 'Incident response, runbooks, root cause analysis, and infrastructure automation guidance',
    category: 'IT Operations',
    modes: [
      { id: 'incident', label: 'Incident', description: 'Triage and response' },
      { id: 'kb-search', label: 'KB Search', description: 'Knowledge base lookup' },
      { id: 'root-cause', label: 'Root Cause', description: 'RCA analysis' },
      { id: 'status-report', label: 'Status Report', description: 'Generate reports' },
      { id: 'runbook', label: 'Runbook', description: 'Create runbooks' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Incident Triage', 'running');
    this.emitThinking(onEvent, `Analysing IT operations request: ${mode}...\n`);
    this.emitStage(onEvent, 0, 'Incident Triage', 'completed');

    this.emitStage(onEvent, 1, 'Knowledge Retrieval', 'running');
    this.emitThinking(onEvent, 'Searching operational knowledge base...\n');
    this.emitStage(onEvent, 1, 'Knowledge Retrieval', 'completed');

    this.emitStage(onEvent, 2, 'Response Generation', 'running');

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['incident'];
    const userMessage = `${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent);

    this.emitStage(onEvent, 2, 'Response Generation', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
