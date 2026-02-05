# @enterprise-agents/prompts

Shared enterprise prompt fragments, compliance rules, and formatting utilities for AI agents built with the Claude Agent SDK.

## Overview

This package provides reusable prompt components that ensure consistency, compliance, and standardized output across all enterprise agents. It includes company context, regulatory rules, and output formatters.

## Installation

```bash
npm install @enterprise-agents/prompts
```

Or in a workspace:

```json
{
  "dependencies": {
    "@enterprise-agents/prompts": "*"
  }
}
```

## Features

- 🏢 **Enterprise Context** - Company information and brand voice
- ⚖️ **Compliance Rules** - GDPR, HR, recruitment, and security guidelines
- 📄 **Output Formatters** - Standardized content formatting helpers
- 🔒 **Data Handling Rules** - Privacy and PII protection guidelines
- ⚠️ **Disclaimer Templates** - Legal and professional disclaimers

## Usage

### Enterprise Context

```typescript
import { 
  ATOS_COMPANY_CONTEXT, 
  ATOS_DIFFERENTIATORS 
} from '@enterprise-agents/prompts';

const systemPrompt = `
${ATOS_COMPANY_CONTEXT}

${ATOS_DIFFERENTIATORS}

Based on the above context, create marketing content...
`;
```

**Output:**
```
COMPANY: Atos SE
INDUSTRY: Global digital transformation, cybersecurity, cloud services
HEADQUARTERS: Paris, France
EMPLOYEES: ~95,000 worldwide

KEY CAPABILITIES:
- Digital Transformation & Cloud Services
- Cybersecurity & Mission-Critical Systems
...
```

### Compliance Rules

```typescript
import { 
  DATA_HANDLING_RULES,
  HR_COMPLIANCE_RULES,
  RECRUITMENT_COMPLIANCE_RULES,
  SECURITY_RULES,
  COMPLIANCE_DISCLAIMER
} from '@enterprise-agents/prompts';

// For HR agents
const hrPrompt = `
${HR_COMPLIANCE_RULES}

Provide employee relations guidance on the following...
`;

// For recruitment agents
const recruitmentPrompt = `
${RECRUITMENT_COMPLIANCE_RULES}

Generate a job description for...
`;

// Append disclaimers to output
const output = `
${generatedContent}

${COMPLIANCE_DISCLAIMER}
`;
```

### Output Formatting

```typescript
import { 
  formatExecutiveSummary,
  formatMarkdownReport,
  formatBulletList,
  wrapSection
} from '@enterprise-agents/prompts';

// Executive summary format
const summary = formatExecutiveSummary(
  'MARKETING CONTENT - BLOG',
  'Marketing Agent',
  contentText,
  {
    Topic: 'AI in Healthcare',
    Mode: 'blog',
    Generated: new Date().toISOString()
  }
);

// Markdown report with sections
const report = formatMarkdownReport(
  'Research Report',
  [
    { heading: 'Executive Summary', content: '...' },
    { heading: 'Key Findings', content: '...' },
    { heading: 'Recommendations', content: '...' }
  ]
);

// Bullet list
const bulletList = formatBulletList([
  'First key point',
  'Second key point',
  'Third key point'
]);

// Section wrapper
const section = wrapSection('RESEARCH FINDINGS', researchContent);
```

## API Reference

### Enterprise Context

#### `ATOS_COMPANY_CONTEXT`

Complete company profile including:
- Company name and industry
- Global presence (employees, countries)
- Key capabilities and services
- Brand values
- Brand voice guidelines

**Usage:** Include in system prompts for enterprise-appropriate content

---

#### `ATOS_DIFFERENTIATORS`

Key competitive differentiators:
- End-to-end capabilities
- Cybersecurity and sovereign cloud expertise
- High-performance computing leadership
- Sustainability commitment
- Global delivery with local expertise
- Patents and innovation

**Usage:** Include when positioning Atos against competitors

---

### Compliance Rules

#### `DATA_HANDLING_RULES`

Privacy and data protection guidelines:
- No PII storage or logging
- Employee data confidentiality
- GDPR principles (minimization, purpose limitation)
- Placeholder data for examples

**Usage:** All agents handling personal or employee data

---

#### `COMPLIANCE_DISCLAIMER`

Standard disclaimer for AI-generated content:
```
DISCLAIMER: This content is AI-generated for informational purposes only.
It does not constitute legal, financial, medical, or professional advice.
Always verify with subject matter experts and consult official policies.
```

**Usage:** Append to all agent outputs

---

#### `HR_COMPLIANCE_RULES`

HR-specific compliance guidelines:
- Equal opportunity requirements
- Non-discriminatory language
- Policy reference instead of definitive statements
- HR representative consultation guidance
- Employee confidentiality

**Usage:** HR agent system prompts

---

#### `RECRUITMENT_COMPLIANCE_RULES`

Recruitment-specific compliance:
- Inclusive, bias-free language requirements
- Prohibited discriminatory references
- Qualifications focus vs. personal characteristics
- Equal opportunity employer statement
- Market-based salary ranges
- Skills-based screening

**Usage:** Recruitment agent system prompts and bias detection

---

#### `SECURITY_RULES`

Security constraint guidelines:
- No credential exposure
- No internal network architecture details
- Sensitive technical detail redaction
- Least-privilege principles
- Security concern flagging

**Usage:** Agents generating external-facing technical content

---

### Output Formatting

#### `formatExecutiveSummary(title, agentName, content, metadata)`

Formats content with professional header, metadata, and agent attribution.

**Parameters:**
- `title: string` - Document title
- `agentName: string` - Agent name for attribution
- `content: string` - Main content body
- `metadata: Record<string, string>` - Key-value metadata

**Returns:** Formatted string with dividers and structure

**Example:**
```typescript
const output = formatExecutiveSummary(
  'PROPOSAL - CLOUD MIGRATION',
  'Presales Agent',
  proposalContent,
  {
    Topic: 'Financial Services Cloud Migration',
    Mode: 'proposal',
    Generated: '2025-02-05T14:30:00Z'
  }
);
```

---

#### `formatMarkdownReport(title, sections)`

Creates a structured markdown document with sections.

**Parameters:**
- `title: string` - Report title (becomes H1)
- `sections: Array<{ heading: string, content: string }>` - Section array

**Returns:** Markdown formatted string

---

#### `formatBulletList(items: string[]): string`

Formats array as indented bullet list.

---

#### `formatNumberedList(items: string[]): string`

Formats array as numbered list.

---

#### `wrapSection(label: string, content: string): string`

Wraps content with labeled dividers for visual separation.

## Prompt Fragment Examples

### Research Stage Prompt

```typescript
import { ATOS_COMPANY_CONTEXT } from '@enterprise-agents/prompts';

const researchPrompt = `
${ATOS_COMPANY_CONTEXT}

Research the following topic for enterprise content:

TOPIC: ${topic}

Gather:
1. Current industry trends
2. Atos capabilities alignment
3. Competitive landscape
4. Client pain points
`;
```

### Generation Stage Prompt

```typescript
import { ATOS_DIFFERENTIATORS } from '@enterprise-agents/prompts';

const generationPrompt = `
${ATOS_DIFFERENTIATORS}

Based on research findings, create content that:
- Highlights relevant Atos capabilities
- Differentiates from competitors
- Provides actionable insights
`;
```

### Compliance Review Prompt

```typescript
import { 
  RECRUITMENT_COMPLIANCE_RULES,
  COMPLIANCE_DISCLAIMER 
} from '@enterprise-agents/prompts';

const reviewPrompt = `
${RECRUITMENT_COMPLIANCE_RULES}

Review the following job description for compliance issues:

${jobDescription}

Check for:
1. Gendered or age-indicative language
2. Culturally biased requirements
3. Unnecessary qualifications
4. Missing equal opportunity statement

Return corrected version with ${COMPLIANCE_DISCLAIMER}
`;
```

## Best Practices

### For Package Maintainers

- ✅ Keep prompts clear and actionable
- ✅ Update company context when organizational changes occur
- ✅ Review compliance rules with legal/HR teams
- ✅ Test formatting functions with various content lengths
- ✅ Document changes in versioning

### For Package Consumers

- ✅ Always include relevant compliance rules
- ✅ Use appropriate company context for brand consistency
- ✅ Append disclaimers to generated content
- ✅ Combine multiple rules when needed (e.g., HR + Data Handling)
- ✅ Customize formatting functions for specific needs

## Content Guidelines

### Company Context

When updating `ATOS_COMPANY_CONTEXT`:
- Verify employee count and country presence
- Align capabilities with current service offerings
- Maintain professional, accessible tone
- Update brand voice to reflect current positioning

### Compliance Rules

When adding new compliance rules:
- Consult with legal/compliance teams
- Be specific and actionable
- Provide examples where helpful
- Reference relevant regulations (GDPR, EEOC, etc.)
- Update related agent prompts

### Output Formatters

When creating new formatters:
- Ensure readability in terminal and files
- Use consistent divider styles
- Consider markdown compatibility
- Support various content lengths
- Provide sensible defaults

## Development

```bash
# Install dependencies
npm install

# Type checking
npm run typecheck

# Build
npm run build

# Clean build artifacts
npm run clean
```

## Testing

```bash
# Test in an agent context
cd ../../agents/recruitment-agent
npm install
npm run typecheck
```

## File Structure

```
src/
├── index.ts             # Public API exports
├── atos-context.ts      # Company context and differentiators
├── enterprise-rules.ts  # Compliance and security rules
└── output-formats.ts    # Formatting helper functions
```

## Examples by Agent Type

### HR Agent

```typescript
import {
  HR_COMPLIANCE_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER
} from '@enterprise-agents/prompts';

const systemPrompt = `
${HR_COMPLIANCE_RULES}
${DATA_HANDLING_RULES}

You are an HR specialist providing guidance...
`;

const output = `${content}\n\n${COMPLIANCE_DISCLAIMER}`;
```

### Marketing Agent

```typescript
import {
  ATOS_COMPANY_CONTEXT,
  ATOS_DIFFERENTIATORS,
  formatExecutiveSummary
} from '@enterprise-agents/prompts';

const systemPrompt = `
${ATOS_COMPANY_CONTEXT}
${ATOS_DIFFERENTIATORS}

You are a marketing content strategist...
`;

const formattedOutput = formatExecutiveSummary(
  'MARKETING CONTENT',
  'Marketing Agent',
  content,
  metadata
);
```

### Recruitment Agent

```typescript
import {
  RECRUITMENT_COMPLIANCE_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER
} from '@enterprise-agents/prompts';

const systemPrompt = `
${RECRUITMENT_COMPLIANCE_RULES}
${DATA_HANDLING_RULES}

Your role is to create bias-free recruitment content...
`;

const output = `${jobDescription}\n\n${COMPLIANCE_DISCLAIMER}`;
```

## Contributing

When contributing to this package:

1. Coordinate with legal/compliance for rule changes
2. Test prompt fragments across multiple agents
3. Maintain consistent formatting styles
4. Update documentation for new exports
5. Consider backward compatibility

## License

MIT License - See [LICENSE.md](../../LICENSE.md)

---

**Part of the Enterprise AI Agent Suite**  
**Maintained by:** Abhilash Jaiswal ([@jaiswal-abhilash](https://linkedin.com/in/jaiswal-abhilash))
