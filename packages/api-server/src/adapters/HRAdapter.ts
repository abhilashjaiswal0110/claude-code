import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are an expert HR Business Partner at a large enterprise technology company (Atos).
You have deep knowledge of HR policies, employment law (UK/India/global), benefits design, employee engagement,
and talent management. You give practical, accurate, and empathetic guidance.
Format your responses with Markdown headings, bullet points, and tables where appropriate.
Always note where an employee should consult HR directly for sensitive decisions.`;

const MODE_PROMPTS: Record<string, string> = {
  policy: `${SYSTEM_BASE}

Your task is to answer HR policy questions accurately. Reference real-world HR best practices.
Include: policy summary, key rules, exceptions to be aware of, and recommended next steps.`,

  benefits: `${SYSTEM_BASE}

Your task is to explain employee benefits clearly. Cover: eligibility criteria, how to enrol,
what is covered, cost implications, and deadlines. Be specific and practical.`,

  engagement: `${SYSTEM_BASE}

Your task is to analyse employee engagement topics or survey data. Identify key themes,
sentiment patterns, systemic issues, and provide prioritised, actionable recommendations
with expected impact and suggested owners/timelines.`,

  onboarding: `${SYSTEM_BASE}

Your task is to create comprehensive, role-appropriate onboarding plans. Include:
pre-joining checklist, Week 1 daily schedule, 30/60/90-day milestones, key contacts,
mandatory training modules, and integration tips.`,

  'exit-interview': `${SYSTEM_BASE}

Your task is to analyse exit interview insights and identify patterns. Surface root causes,
systemic issues, and provide data-driven retention recommendations with priority ranking
and estimated attrition reduction impact.`,
};

export class HRAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'hr-agent',
    name: 'HR Agent',
    description: 'HR policy guidance, benefits explanations, engagement analysis, onboarding guides, and exit interview summaries',
    category: 'HR',
    modes: [
      { id: 'policy', label: 'Policy Query', description: 'Answer questions about company policies' },
      { id: 'benefits', label: 'Benefits', description: 'Explain employee benefits and enrollment' },
      { id: 'engagement', label: 'Engagement', description: 'Analyze employee engagement data' },
      { id: 'onboarding', label: 'Onboarding', description: 'Create onboarding guides and checklists' },
      { id: 'exit-interview', label: 'Exit Interview', description: 'Summarize exit interview insights' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Classification', 'running');
    this.emitThinking(onEvent, `Processing ${mode} request...\n`);
    this.emitStage(onEvent, 0, 'Classification', 'completed');

    this.emitStage(onEvent, 1, 'Policy Search', 'running');
    this.emitThinking(onEvent, 'Retrieving relevant policy context and best practices...\n');
    this.emitStage(onEvent, 1, 'Policy Search', 'completed');

    this.emitStage(onEvent, 2, 'Response Generation', 'running');

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['policy'];
    const userMessage = `${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent);

    this.emitStage(onEvent, 2, 'Response Generation', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
