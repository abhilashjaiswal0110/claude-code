/**
 * Stage prompts for Cloud Operations Agent
 */

import {
  ATOS_COMPANY_CONTEXT,
  ATOS_DIFFERENTIATORS,
  CLOUD_OPERATIONS_COMPLIANCE_RULES,
  SECURITY_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER,
} from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { CLOUD_OPS_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { CloudOpsMode } from './types.js';

const personaContext = buildPersonaContext(CLOUD_OPS_PERSONA);

const MODE_INSTRUCTIONS: Record<CloudOpsMode, string> = {
  'cost-optimization': `Perform comprehensive cloud cost optimization analysis:
- Identify unused and idle resources across compute, storage, network
- Analyze right-sizing opportunities based on utilization patterns
- Evaluate Reserved Instance / Savings Plan coverage and recommendations
- Identify Spot Instance candidates for fault-tolerant workloads
- Review storage tiers and lifecycle policies
- Analyze data transfer costs and optimization strategies
- Evaluate licensing optimization (BYOL, hybrid benefits)
- Check for orphaned resources (unattached volumes, old snapshots)
- Review tagging compliance for cost allocation
- Calculate potential savings with confidence ranges
- Prioritize recommendations by ROI and implementation effort
- Reference FinOps Foundation maturity model and capabilities`,

  'incident-response': `Analyze incident and provide response guidance:
- Classify incident severity (P1-P4) with clear criteria
- Identify affected services and blast radius
- Establish timeline of events with root cause analysis
- Provide immediate mitigation steps
- Recommend communication templates for stakeholders
- Define escalation paths and responsibilities
- Suggest monitoring and alerting improvements
- Create blameless postmortem structure
- Identify systemic issues and prevention measures
- Reference SRE incident management practices
- Include runbook recommendations for similar incidents
- Calculate impact metrics (MTTR, MTTD, affected users)`,

  'capacity-planning': `Develop comprehensive capacity plan:
- Analyze current resource utilization patterns
- Project growth based on business drivers and historical trends
- Identify performance bottlenecks and constraints
- Recommend scaling strategies (vertical, horizontal, serverless)
- Design auto-scaling policies with appropriate thresholds
- Calculate reserve capacity for peak loads and failures
- Consider geographic distribution requirements
- Evaluate burst capacity options (cloud bursting, CDN)
- Plan for seasonal variations and special events
- Include cost implications of capacity decisions
- Define capacity monitoring and alerting thresholds
- Create capacity review cadence recommendations`,

  'architecture-review': `Conduct Well-Architected Framework review:
- Evaluate against all six pillars:
  * Operational Excellence: runbooks, observability, continuous improvement
  * Security: IAM, encryption, network security, compliance
  * Reliability: fault tolerance, DR, backup, recovery
  * Performance Efficiency: right-sizing, caching, CDN, optimization
  * Cost Optimization: resource efficiency, pricing models, governance
  * Sustainability: resource efficiency, managed services, data lifecycle
- Identify high-risk items (HRIs) with severity ratings
- Map findings to specific AWS/Azure/GCP services and configurations
- Provide remediation recommendations with priority
- Include reference architectures and design patterns
- Calculate risk scores by pillar
- Create improvement roadmap with milestones`,

  'migration-assessment': `Perform cloud migration assessment:
- Inventory source environment (applications, data, dependencies)
- Classify workloads by migration strategy (6Rs):
  * Rehost (lift and shift)
  * Replatform (lift and reshape)
  * Refactor (re-architect)
  * Repurchase (replace with SaaS)
  * Retire (decommission)
  * Retain (keep on-premises)
- Map dependencies and identify migration waves
- Assess application compatibility and required changes
- Evaluate data migration requirements and strategies
- Identify risks and mitigation strategies
- Estimate migration timeline and resource requirements
- Calculate TCO comparison (current vs. target state)
- Define success criteria and validation approach
- Create migration runbook outline
- Include rollback strategies for each wave`,
};

export function buildStages(mode: CloudOpsMode): StageConfig[] {
  return [
    {
      name: 'Discovery',
      description: 'Discover cloud environment and context',
      systemPromptAppend: `You are a cloud discovery specialist. ${personaContext}`,
      allowedTools: ['WebSearch'],
      maxTurns: 5,
      maxBudgetUsd: 0.5,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

${ATOS_DIFFERENTIATORS}

Discover and analyze cloud context:

TOPIC: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Provide:
1. Environment scope (cloud providers, regions, services)
2. Current architecture patterns and technologies
3. Relevant cloud provider services and best practices
4. Industry benchmarks and standards
5. Applicable compliance requirements
6. Current cloud provider pricing and feature updates
7. Well-Architected Framework guidance for this scenario

Research current cloud best practices, pricing, and service recommendations.`,
    },
    {
      name: 'Analysis',
      description: 'Analyze cloud infrastructure and data',
      systemPromptAppend: `You are a cloud infrastructure analyst. ${DATA_HANDLING_RULES}\n\n${SECURITY_RULES}`,
      allowedTools: ['Read', 'Grep', 'Glob', 'WebSearch'],
      maxTurns: 10,
      maxBudgetUsd: 1.0,
      buildPrompt: (ctx) => `
Based on this discovery:
${ctx.previousResults['Discovery']}

Perform detailed analysis for:
TOPIC: ${ctx.topic}
MODE: ${mode}

Tasks:
- Search for relevant infrastructure configs, runbooks, and docs in data/
- Analyze architecture diagrams and deployment configurations
- Review monitoring data and utilization patterns
- Check for compliance with cloud provider best practices
- Identify optimization opportunities and risks
- Research comparable architectures and solutions
- Gather relevant metrics and benchmarks

Document all findings with evidence and sources.
Note any security-sensitive information that should be redacted.`,
    },
    {
      name: 'Recommendations',
      description: `Generate ${mode} recommendations`,
      systemPromptAppend: `${personaContext}\n\n${CLOUD_OPERATIONS_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 6,
      maxBudgetUsd: 0.75,
      buildPrompt: (ctx) => `
${personaContext}

DISCOVERY:
${ctx.previousResults['Discovery']}

ANALYSIS:
${ctx.previousResults['Analysis']}

TOPIC: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Generate comprehensive recommendations with:
- Specific cloud service recommendations with rationale
- Implementation steps and prerequisites
- Cost implications and ROI estimates
- Risk assessment and mitigation strategies
- Timeline and resource requirements
- Success metrics and KPIs
- Rollback and contingency plans
- Automation opportunities (IaC templates, scripts)`,
    },
    {
      name: 'Operational Review',
      description: 'Review operational readiness and compliance',
      systemPromptAppend: `You are a cloud operations reviewer. ${CLOUD_OPERATIONS_COMPLIANCE_RULES}\n\n${SECURITY_RULES}`,
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Review this cloud operations analysis for completeness:

RECOMMENDATIONS:
${ctx.previousResults['Recommendations']}

MODE: ${mode}

Verify:
1. Recommendations align with Well-Architected Framework
2. Security baseline configurations are included
3. Cost estimates are reasonable and documented
4. Compliance requirements are addressed
5. Disaster recovery considerations are included
6. Monitoring and alerting recommendations are complete
7. Change management process is considered
8. Skills and training needs are identified
9. Vendor lock-in risks are assessed

Provide the final output with any corrections and these disclaimers:

${COMPLIANCE_DISCLAIMER}

CLOUD OPERATIONS DISCLAIMER:
Cloud recommendations are based on available information and current best practices.
Actual costs, performance, and outcomes may vary based on implementation,
workload characteristics, and cloud provider changes. Test all changes in
non-production environments. Consult your cloud provider documentation and
support for authoritative guidance.

If corrections are needed, make them and explain what was changed.`,
    },
  ];
}
