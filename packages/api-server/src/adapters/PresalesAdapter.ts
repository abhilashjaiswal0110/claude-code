import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Senior Presales Solutions Architect and Sales Consultant at Atos.
You have expertise in enterprise IT solutions, competitive positioning, proposal writing, and deal strategy.
You understand complex B2B sales cycles and how to build compelling business cases.
Format output with clear Markdown. Provide actionable, deal-winning content.`;

const MODE_PROMPTS: Record<string, string> = {
  proposal: `${SYSTEM_BASE}

Create a structured solution proposal. Include:
- Executive summary and business case
- Understanding of client challenges
- Proposed solution architecture
- Key differentiators vs alternatives
- Implementation approach and timeline
- Investment summary (structure placeholder for actual pricing)
- ROI justification
- Risk mitigation
- Next steps`,

  competitor: `${SYSTEM_BASE}

Provide a thorough competitive analysis. Include:
- Competitor overview and market positioning
- Feature/capability comparison matrix
- Pricing model differences
- Strengths and weaknesses (honest assessment)
- Our differentiation points
- Battle card: how to handle objections
- Win strategy recommendations`,

  rfp: `${SYSTEM_BASE}

Create a compelling RFP response. Include:
- Executive summary
- Compliance matrix (requirements addressed)
- Technical approach and architecture
- Project team and credentials
- Delivery methodology
- Risk management plan
- Commercial summary
- References and case studies section`,

  'pitch-deck': `${SYSTEM_BASE}

Design a pitch deck outline with speaker notes. Create 10-12 slides:
1. Title slide
2. Problem/opportunity statement
3. Market context and size
4. Our solution overview
5. How it works (architecture/demo)
6. Key differentiators
7. Business value and ROI
8. Implementation roadmap
9. Team and credentials
10. Pricing/investment
11. Next steps and CTA
Include bullet points and speaker notes for each slide.`,

  'win-loss': `${SYSTEM_BASE}

Analyse win/loss patterns and provide strategic insights. Cover:
- Win rate analysis by segment/product/geography
- Top reasons for wins (reinforced strengths)
- Top reasons for losses (actionable gaps)
- Competitive patterns identified
- Deal velocity and cycle analysis
- Recommendations for improving win rate
- Priority actions with expected impact`,
};

export class PresalesAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'presales-agent',
    name: 'Presales Agent',
    description: 'Proposals, competitive analysis, RFP responses, pitch decks, and win/loss analysis',
    category: 'Sales',
    modes: [
      { id: 'proposal', label: 'Proposal', description: 'Solution proposal writing' },
      { id: 'competitor', label: 'Competitor Analysis', description: 'Competitive intelligence' },
      { id: 'rfp', label: 'RFP Response', description: 'RFP/tender response' },
      { id: 'pitch-deck', label: 'Pitch Deck', description: 'Presentation outline' },
      { id: 'win-loss', label: 'Win/Loss', description: 'Deal analysis' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Deal Analysis', 'running');
    this.emitThinking(onEvent, `Analysing presales context for ${mode}...\n`);
    this.emitStage(onEvent, 0, 'Deal Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Content Generation', 'running');
    this.emitThinking(onEvent, 'Generating sales content...\n');

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['proposal'];
    const userMessage = `${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent, 4096, signal);

    this.emitStage(onEvent, 1, 'Content Generation', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
