/**
 * Stage prompts for Accessibility Compliance Agent
 */

import {
  ATOS_COMPANY_CONTEXT,
  ACCESSIBILITY_COMPLIANCE_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER,
} from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { ACCESSIBILITY_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { AccessibilityMode } from './types.js';

const personaContext = buildPersonaContext(ACCESSIBILITY_PERSONA);

const MODE_INSTRUCTIONS: Record<AccessibilityMode, string> = {
  'wcag-audit': `Perform a comprehensive WCAG accessibility audit:
- Identify the target conformance level (A, AA, or AAA)
- Evaluate against all applicable WCAG 2.1/2.2 success criteria
- Categorize findings by principle (Perceivable, Operable, Understandable, Robust)
- Rate issues by severity: critical, serious, moderate, minor
- Include specific success criteria references (e.g., "1.4.3 Contrast (Minimum)")
- Document affected user groups for each issue
- Provide automated tool recommendations (axe, WAVE, Lighthouse)
- Include manual testing checklist items
- Note browser/assistive technology compatibility issues
- Calculate overall conformance score where applicable`,

  'remediation-plan': `Create a detailed accessibility remediation plan:
- List all identified accessibility issues with WCAG criteria
- Prioritize by: legal risk, user impact, implementation complexity
- Provide specific code fixes with before/after examples
- Include HTML, CSS, and JavaScript solutions as needed
- Reference WAI-ARIA authoring practices for complex widgets
- Define acceptance criteria for each fix
- Specify testing methods (automated, manual, AT testing)
- Group related fixes for efficient implementation
- Estimate effort levels (quick win, moderate, complex)
- Create implementation timeline with milestones
- Include regression testing recommendations`,

  'alt-text': `Generate and review alternative text for images:
- Analyze image context and purpose (informative, decorative, functional)
- Write concise, descriptive alt text (typically 125 characters or less)
- For decorative images, recommend empty alt="" attribute
- For complex images (charts, diagrams), suggest long descriptions
- Consider surrounding context to avoid redundancy
- Follow WCAG 1.1.1 Non-text Content guidelines
- Include guidance for image types: photos, icons, logos, charts, diagrams
- Address SVG accessibility considerations
- Provide alt text templates for common patterns
- Note when extended descriptions (aria-describedby) are needed`,

  'aria-review': `Review and recommend ARIA implementation:
- Audit existing ARIA attributes for correctness
- Identify missing ARIA roles, states, and properties
- Reference WAI-ARIA Authoring Practices Guide patterns
- Check for ARIA anti-patterns and misuse
- Verify keyboard interaction patterns match ARIA roles
- Ensure dynamic content updates are announced appropriately
- Review live regions (aria-live, aria-atomic, aria-relevant)
- Check landmark regions for proper page structure
- Validate focus management in dynamic content
- Provide corrected code examples with explanations
- Note first rule of ARIA: prefer native HTML when possible`,

  'compliance-report': `Generate a comprehensive accessibility compliance report:
- Executive summary with overall compliance status
- Scope definition (pages, components, platforms tested)
- Standards tested against (WCAG 2.1 AA, Section 508, EN 301 549)
- Methodology overview (tools used, testing approach)
- Detailed findings organized by severity and WCAG principle
- Issue counts and conformance percentage by category
- Screenshots or descriptions of critical failures
- Affected user populations for each issue type
- Remediation roadmap with prioritized recommendations
- Certification readiness assessment (VPAT, ACR)
- Legal risk summary and recommendations
- Appendix with full issue inventory`,
};

export function buildStages(mode: AccessibilityMode): StageConfig[] {
  return [
    {
      name: 'Scope Analysis',
      description: 'Analyze accessibility scope and requirements',
      systemPromptAppend: `You are an accessibility scope analyst. ${personaContext}`,
      allowedTools: ['WebSearch'],
      maxTurns: 5,
      maxBudgetUsd: 0.5,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

Analyze the accessibility scope and requirements:

TOPIC: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Provide:
1. Scope clarification (what is being audited/reviewed)
2. Applicable standards (WCAG 2.1, 2.2, Section 508, EN 301 549)
3. Target conformance level (A, AA, AAA) with justification
4. Affected user groups and assistive technologies
5. Legal/regulatory requirements based on jurisdiction and industry
6. Testing methodology recommendations
7. Current accessibility landscape and best practices

Research current WCAG guidelines, legal requirements, and industry standards.`,
    },
    {
      name: 'Technical Review',
      description: 'Perform technical accessibility analysis',
      systemPromptAppend: `You are an accessibility technical specialist. ${DATA_HANDLING_RULES}`,
      allowedTools: ['Read', 'Grep', 'Glob', 'WebSearch'],
      maxTurns: 10,
      maxBudgetUsd: 1.0,
      buildPrompt: (ctx) => `
Based on this scope analysis:
${ctx.previousResults['Scope Analysis']}

Perform technical accessibility analysis for:
TOPIC: ${ctx.topic}
MODE: ${mode}

Tasks:
- Search for relevant code, templates, or content in data/
- Analyze HTML structure, ARIA implementation, and semantic markup
- Check keyboard navigation and focus management patterns
- Review color contrast and visual presentation
- Assess form accessibility and error handling
- Evaluate dynamic content and state changes
- Research applicable WCAG success criteria
- Identify automated testing results if available
- Note assistive technology compatibility considerations

Document all findings with specific WCAG references.`,
    },
    {
      name: 'Recommendations',
      description: `Generate ${mode} recommendations`,
      systemPromptAppend: `${personaContext}\n\n${ACCESSIBILITY_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 6,
      maxBudgetUsd: 0.75,
      buildPrompt: (ctx) => `
${personaContext}

SCOPE ANALYSIS:
${ctx.previousResults['Scope Analysis']}

TECHNICAL REVIEW:
${ctx.previousResults['Technical Review']}

TOPIC: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Generate comprehensive accessibility recommendations with:
- Specific WCAG success criteria references
- Clear severity ratings and user impact
- Actionable fixes with code examples where applicable
- Testing verification methods
- Prioritization guidance
- Assistive technology considerations`,
    },
    {
      name: 'Compliance Verification',
      description: 'Verify compliance accuracy and completeness',
      systemPromptAppend: `You are an accessibility compliance verifier. ${ACCESSIBILITY_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Review this accessibility analysis for accuracy:

RECOMMENDATIONS:
${ctx.previousResults['Recommendations']}

MODE: ${mode}

Verify:
1. WCAG success criteria are correctly referenced with version
2. Severity ratings align with user impact
3. Remediation advice is technically accurate
4. Code examples follow accessibility best practices
5. All disability types are considered (visual, auditory, motor, cognitive)
6. Testing methods are appropriate and complete
7. Legal/regulatory context is accurate
8. Recommendations are actionable and prioritized

Provide the final output with any corrections and these disclaimers:

${COMPLIANCE_DISCLAIMER}

ACCESSIBILITY DISCLAIMER:
This accessibility review is based on available information and expert analysis.
Comprehensive accessibility testing requires both automated tools and manual testing
with assistive technologies. Consider engaging users with disabilities for usability
testing. Consult legal counsel for compliance obligations in your jurisdiction.

If corrections are needed, make them and note what was changed.`,
    },
  ];
}
