import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Sustainability and ESG (Environmental, Social, Governance) specialist at Atos.
You have expertise in carbon accounting, green IT, ESG reporting frameworks (GRI, TCFD, CDP, CSRD),
and enterprise sustainability strategy. You provide data-driven, actionable recommendations.
Format with clear Markdown including tables, metrics, and roadmaps.`;

const MODE_PROMPTS: Record<string, string> = {
  'carbon-footprint': `${SYSTEM_BASE}

Conduct a carbon footprint analysis framework. Include:
- Scope 1, 2, 3 emissions categorisation
- Data collection methodology
- Emission factor sources (DEFRA, EPA, IEA)
- Calculation approach per category
- Hotspot identification
- Baseline setting process
- Reduction target framework (science-based targets)
- Reporting requirements`,

  'green-it': `${SYSTEM_BASE}

Develop a Green IT strategy and action plan. Include:
- IT environmental impact assessment (energy, hardware, data centres)
- PUE (Power Usage Effectiveness) benchmarking
- Hardware lifecycle and circular economy approach
- Cloud vs on-prem sustainability comparison
- Software efficiency and green coding practices
- Procurement criteria (environmental standards)
- Measurable KPIs and targets
- Quick wins vs long-term investments`,

  'sustainability-report': `${SYSTEM_BASE}

Create a sustainability report structure and content. Follow leading frameworks:
- Executive summary
- Materiality assessment
- Governance and oversight
- Environmental performance (GHG, energy, water, waste)
- Social performance (DEI, employee wellbeing, community)
- Governance performance (ethics, supply chain, data privacy)
- Progress against targets
- Forward-looking commitments
- GRI/CSRD compliance checklist`,

  'energy-optimization': `${SYSTEM_BASE}

Design an energy optimisation programme. Include:
- Energy consumption baseline and audit approach
- Renewable energy transition roadmap
- Data centre efficiency improvements
- Building and workplace energy management
- Employee behaviour change programme
- Technology investments with ROI analysis
- Energy procurement strategy
- Regulatory compliance (ISO 50001, ESOS)`,

  'esg-compliance': `${SYSTEM_BASE}

Create an ESG compliance and reporting framework. Include:
- Applicable regulations and frameworks (CSRD, TCFD, SFDR)
- Materiality assessment process
- Data governance and collection systems
- KPI definitions and calculation methodology
- Assurance and verification approach
- Stakeholder disclosure requirements
- Gap analysis against current state
- Implementation roadmap with milestones`,
};

export class SustainabilityAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'sustainability',
    name: 'Sustainability Agent',
    description: 'Carbon footprint, green IT, sustainability reporting, energy optimisation, and ESG compliance',
    category: 'Sustainability',
    modes: [
      { id: 'carbon-footprint', label: 'Carbon Footprint', description: 'Emissions analysis' },
      { id: 'green-it', label: 'Green IT', description: 'IT sustainability strategy' },
      { id: 'sustainability-report', label: 'Report', description: 'ESG reporting' },
      { id: 'energy-optimization', label: 'Energy', description: 'Energy optimisation' },
      { id: 'esg-compliance', label: 'ESG Compliance', description: 'Regulatory compliance' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'ESG Analysis', 'running');
    this.emitThinking(onEvent, `Analysing sustainability context: ${topic}...\n`);
    this.emitStage(onEvent, 0, 'ESG Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Recommendations', 'running');
    this.emitThinking(onEvent, `Generating ${mode} content...\n`);

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['sustainability-report'];
    const userMessage = `${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent);

    this.emitStage(onEvent, 1, 'Recommendations', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
