/**
 * Stage prompts for Sustainability Agent
 */

import {
  ATOS_COMPANY_CONTEXT,
  ATOS_DIFFERENTIATORS,
  SUSTAINABILITY_COMPLIANCE_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER,
} from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { SUSTAINABILITY_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { SustainabilityMode } from './types.js';

const personaContext = buildPersonaContext(SUSTAINABILITY_PERSONA);

const MODE_INSTRUCTIONS: Record<SustainabilityMode, string> = {
  'carbon-footprint': `Perform a comprehensive carbon footprint analysis:
- Categorize emissions by GHG Protocol scopes (Scope 1, 2, 3)
- Identify major emission sources and hotspots
- Apply appropriate emission factors with source citations
- Calculate total carbon footprint with methodology explanation
- Benchmark against industry standards and peers
- Provide reduction targets aligned with Science-Based Targets (SBTi)
- Recommend decarbonization pathways with timeline
- Include data quality assessment and uncertainty ranges
- Suggest monitoring and verification approaches`,

  'green-it': `Develop a comprehensive Green IT strategy:
- Assess current IT infrastructure environmental impact
- Evaluate data center efficiency (PUE, CUE, WUE metrics)
- Identify hardware lifecycle optimization opportunities
- Recommend cloud migration and consolidation strategies
- Suggest sustainable procurement criteria
- Address e-waste management and circular economy
- Propose energy-efficient computing practices
- Include software sustainability considerations
- Provide implementation roadmap with quick wins and long-term initiatives
- Calculate potential energy and cost savings`,

  'sustainability-report': `Generate a comprehensive sustainability report:
- Executive summary with key achievements and challenges
- Environmental metrics (emissions, energy, water, waste)
- Social metrics (workforce, community, supply chain)
- Governance metrics (ethics, risk management, compliance)
- Progress against published targets and commitments
- Alignment with reporting frameworks (GRI, CDP, TCFD, SASB)
- Material topics and stakeholder engagement summary
- Future commitments and roadmap
- Third-party assurance considerations
- KPIs with year-over-year comparisons`,

  'energy-optimization': `Provide detailed energy optimization recommendations:
- Analyze current energy consumption patterns and baselines
- Identify inefficiencies and waste across operations
- Evaluate renewable energy options and feasibility
- Recommend demand-side management strategies
- Suggest infrastructure upgrades with ROI analysis
- Address peak load management and load shifting
- Include HVAC, lighting, and equipment optimization
- Propose monitoring and energy management systems
- Calculate projected savings (kWh, CO2, cost)
- Prioritize interventions by impact and investment`,

  'esg-compliance': `Assess ESG compliance and provide guidance:
- Identify applicable regulatory frameworks (EU CSRD, SEC Climate Rules, etc.)
- Evaluate current disclosure practices against requirements
- Map ESG metrics to reporting standards (GRI, SASB, TCFD)
- Identify compliance gaps and risks
- Recommend remediation actions with timeline
- Address data collection and management requirements
- Suggest governance structure improvements
- Include stakeholder communication strategy
- Provide assurance readiness assessment
- Outline upcoming regulatory changes and preparation`,
};

export function buildStages(mode: SustainabilityMode): StageConfig[] {
  return [
    {
      name: 'Assessment',
      description: 'Assess sustainability context and requirements',
      systemPromptAppend: `You are a sustainability assessment specialist. ${personaContext}`,
      allowedTools: ['WebSearch'],
      maxTurns: 5,
      maxBudgetUsd: 0.75,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

${ATOS_DIFFERENTIATORS}

Assess the sustainability context for this request:

TOPIC: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Provide:
1. Scope definition and boundaries for analysis
2. Relevant industry context and benchmarks
3. Applicable frameworks and standards (GHG Protocol, GRI, ISO 14064, etc.)
4. Key stakeholders and their interests
5. Data requirements and availability assessment
6. Current best practices and emerging trends
7. Regulatory landscape and compliance considerations

Use web search to gather current sustainability standards, benchmarks, and best practices.
Be specific about methodology and data sources.`,
    },
    {
      name: 'Data Collection',
      description: 'Gather sustainability data and metrics',
      systemPromptAppend: `You are a sustainability data analyst. ${DATA_HANDLING_RULES}`,
      allowedTools: ['Read', 'Grep', 'Glob', 'WebSearch'],
      maxTurns: 8,
      maxBudgetUsd: 1.0,
      buildPrompt: (ctx) => `
Based on this assessment:
${ctx.previousResults['Assessment']}

Collect and organize data for:
TOPIC: ${ctx.topic}
MODE: ${mode}

Tasks:
- Search for relevant internal data, policies, and baseline documents in data/
- Research industry benchmarks, emission factors, and best practices
- Identify data gaps and suggest proxy data or estimation methods
- Compile relevant metrics with sources and confidence levels
- Note data quality issues and limitations

Organize findings by category with clear source attribution.
Use appropriate emission factors and conversion methodologies.`,
    },
    {
      name: 'Analysis',
      description: `Generate ${mode} analysis and recommendations`,
      systemPromptAppend: `${personaContext}\n\n${SUSTAINABILITY_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 6,
      maxBudgetUsd: 0.75,
      buildPrompt: (ctx) => `
${personaContext}

ASSESSMENT:
${ctx.previousResults['Assessment']}

DATA COLLECTED:
${ctx.previousResults['Data Collection']}

TOPIC: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Generate comprehensive analysis with:
- Clear methodology explanation
- Quantified findings with units and baselines
- Evidence-based recommendations with priority ranking
- Implementation considerations and timeline
- Expected outcomes and ROI where applicable
- Monitoring and continuous improvement approach
- Limitations and assumptions clearly stated`,
    },
    {
      name: 'Compliance Review',
      description: 'Verify compliance and add sustainability disclaimers',
      systemPromptAppend: `You are a sustainability compliance reviewer. ${SUSTAINABILITY_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Review this sustainability analysis for accuracy and compliance:

ANALYSIS:
${ctx.previousResults['Analysis']}

MODE: ${mode}

Verify:
1. Methodology aligns with recognized standards (GHG Protocol, ISO 14064, GRI)
2. Claims are supported by data with appropriate uncertainty ranges
3. No greenwashing - language is accurate and qualified
4. Regulatory requirements are correctly referenced
5. Recommendations are actionable and realistic
6. Data sources and limitations are transparent
7. Measurement boundaries and scope are clear

Provide the final output with any necessary corrections and this disclaimer:

${COMPLIANCE_DISCLAIMER}

SUSTAINABILITY DISCLAIMER:
Environmental metrics are estimates based on available data and standard methodologies.
Actual results may vary based on implementation, data quality, and external factors.
Third-party verification is recommended for external reporting purposes.

If corrections are needed, make them and explain what was changed.`,
    },
  ];
}
