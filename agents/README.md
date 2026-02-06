# Enterprise AI Agents

This directory contains production-ready AI agents built with the Claude Agent SDK, designed for enterprise workflows and business functions.

## Overview

These agents leverage the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) to provide specialized AI assistance for common enterprise tasks. Each agent follows a multi-stage pipeline architecture with:

- **Research stages** - Gather context and information
- **Generation stages** - Create content or recommendations
- **Review stages** - Quality assurance and compliance checking

## Available Agents

### 🧑‍💼 HR Agent
**Purpose:** Employee relations, policy guidance, and onboarding support

**Modes:**
- `policy` - Policy lookup and guidance
- `onboarding` - New hire onboarding plans
- `performance` - Performance review assistance
- `employee-relations` - Employee relations guidance

**Tech Stack:** TypeScript, Claude Agent SDK, local policy documents

[View Documentation →](./hr-agent/README.md)

---

### 🖥️ IT Operations Agent
**Purpose:** Infrastructure management, incident response, and automation

**Modes:**
- `incident` - Incident response and troubleshooting
- `monitoring` - Monitoring strategy and alerts
- `automation` - Automation script generation
- `documentation` - Runbook and documentation creation

**Tech Stack:** TypeScript, Claude Agent SDK, infrastructure tooling integration

[View Documentation →](./it-operations-agent/README.md)

---

### 📢 Marketing & Communication Agent
**Purpose:** Enterprise marketing content generation

**Modes:**
- `blog` - Long-form technical blog posts with SEO
- `social` - Multi-platform social media calendars
- `campaign` - Full campaign briefs with messaging
- `press-release` - AP-style press releases
- `newsletter` - Email newsletters with CTAs

**Tech Stack:** TypeScript, Claude Agent SDK, web research

[View Documentation →](./marketing-agent/README.md)

---

### 📝 Recruitment Agent
**Purpose:** Hiring support with built-in bias detection and compliance

**Modes:**
- `jd` - Inclusive job descriptions
- `screening` - Resume screening frameworks
- `interview` - Structured interview questions
- `comparison` - Candidate comparison matrices
- `offer` - Offer letter templates

**Features:** Automatic bias detection, GDPR compliance, equal opportunity validation

**Tech Stack:** TypeScript, Claude Agent SDK, compliance rule engine

[View Documentation →](./recruitment-agent/README.md)

---

### 💼 Presales/Sales Agent
**Purpose:** Proposal generation, competitive analysis, and deal support

**Modes:**
- `proposal` - Full technical proposals
- `competitor` - Competitive intelligence and positioning
- `rfp` - RFP response drafting
- `pitch-deck` - Slide-by-slide pitch deck outlines
- `win-loss` - Deal pattern analysis

**Tech Stack:** TypeScript, Claude Agent SDK, internal case studies

[View Documentation →](./presales-agent/README.md)

---

### 📚 Learning & Development Agent
**Purpose:** Training and skill development planning

**Modes:**
- `skill-gap` - Skills gap analysis
- `learning-path` - Personalized learning plans
- `training` - Course and resource recommendations
- `assessment` - Competency assessment questions
- `team-matrix` - Team skill matrix and upskilling plans

**Tech Stack:** TypeScript, Claude Agent SDK, market research

[View Documentation →](./learning-dev-agent/README.md)

---

### 🔗 LinkedIn Content Generator
**Purpose:** Professional LinkedIn content creation with research

**Features:**
- Web research for current trends and data
- Two post variations (hook-focused and value-focused)
- Image suggestions with descriptions
- Optimal scheduling recommendations

**Tech Stack:** TypeScript, Claude Agent SDK, web search

[View Documentation →](./linkedin-content-generator/README.md)

---

### 🌱 Sustainability Agent
**Purpose:** IT sustainability, carbon footprint analysis, and ESG compliance

**Modes:**
- `carbon-footprint` - GHG Protocol Scope 1, 2, 3 emissions analysis
- `green-it` - Sustainable infrastructure and data center optimization
- `sustainability-report` - GRI, CDP, TCFD-aligned reporting
- `energy-optimization` - Energy efficiency and renewable integration
- `esg-compliance` - Regulatory compliance assessment (EU CSRD, SEC)

**Tech Stack:** TypeScript, Claude Agent SDK, sustainability frameworks

[View Documentation →](./sustainability-agent/README.md)

---

### ♿ Accessibility Compliance Agent
**Purpose:** Digital accessibility auditing and WCAG compliance

**Modes:**
- `wcag-audit` - Full WCAG 2.1/2.2 conformance audit
- `remediation-plan` - Prioritized fix roadmap with code examples
- `alt-text` - Image alternative text generation and review
- `aria-review` - WAI-ARIA implementation analysis
- `compliance-report` - VPAT/ACR compliance documentation

**Features:** ADA, Section 508, EN 301 549 standards support

**Tech Stack:** TypeScript, Claude Agent SDK, accessibility standards

[View Documentation →](./accessibility-agent/README.md)

---

### ☁️ Cloud Operations Agent
**Purpose:** Multi-cloud operations, FinOps, and SRE practices

**Modes:**
- `cost-optimization` - FinOps-aligned cloud spend analysis
- `incident-response` - SRE incident analysis and postmortems
- `capacity-planning` - Growth forecasting and scaling strategy
- `architecture-review` - Well-Architected Framework assessments
- `migration-assessment` - 6Rs cloud migration planning

**Tech Stack:** TypeScript, Claude Agent SDK, AWS/Azure/GCP frameworks

[View Documentation →](./cloud-ops-agent/README.md)

## Shared Infrastructure

All agents leverage shared packages for consistency:

### [@enterprise-agents/core](../packages/agent-core/)
Shared SDK utilities:
- Pipeline execution engine
- CLI argument parsing
- Structured logging
- Output file management
- Environment validation

### [@enterprise-agents/prompts](../packages/agent-prompts/)
Reusable components:
- Enterprise context (Atos company info)
- Compliance rules (GDPR, HR, Security)
- Output formatting helpers
- Persona base interface

## Architecture

```
agents/
├── <agent-name>/
│   ├── src/
│   │   ├── index.ts        # Main entry point
│   │   ├── persona.ts      # Agent persona configuration
│   │   ├── prompts.ts      # Stage prompt builders
│   │   └── types.ts        # TypeScript type definitions
│   ├── data/               # Local data files (policies, templates)
│   ├── output/             # Generated content (gitignored)
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── .env.example        # Environment template
│   ├── .gitignore          # Ignored files
│   └── README.md           # Agent documentation
```

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)

### Setup

```bash
# Navigate to an agent directory
cd agents/marketing-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the agent
npm start "Your Topic Here"
```

### With Specific Mode

```bash
# Run with a specific mode
npm start -- --mode social "Cloud Security Trends 2025"

# Run with additional context
npm start -- --mode blog "AI in Healthcare" --context "Focus on data privacy"
```

## Development

### Creating a New Agent

1. **Copy an existing agent** as a template
2. **Update persona** in `src/persona.ts`
3. **Define modes and stages** in `src/prompts.ts`
4. **Add type definitions** in `src/types.ts`
5. **Configure package.json** with agent name and description
6. **Test the pipeline** with sample topics

### Testing

```bash
# Type checking
npm run typecheck

# Build
npm run build

# Development mode with watch
npm run dev
```

## Budget Management

Each agent has configurable budget limits per stage:

- **Research stages**: $1.50 - $3.00 (web search intensive)
- **Generation stages**: No limit (deterministic)
- **Review stages**: $0.50 - $1.00 (validation focused)

Turn limits ensure agents don't exceed budget expectations.

## Best Practices

### For Agent Developers

- ✅ **Use shared packages** for common utilities
- ✅ **Define clear stage boundaries** with single responsibilities
- ✅ **Include compliance checks** where applicable (HR, recruitment)
- ✅ **Document expected inputs and outputs**
- ✅ **Test with real-world scenarios**

### For Agent Users

- ✅ **Provide specific topics** for better results
- ✅ **Use appropriate modes** for your use case
- ✅ **Review generated content** before publication
- ✅ **Check for compliance** with company policies
- ✅ **Iterate on prompts** if results aren't satisfactory

## Output Management

All agents save output in dual format:

- **`.txt` files** - Human-readable formatted content
- **`.json` files** - Structured data for programmatic use

Files are timestamped and topic-slugged for easy retrieval:
```
output/2025-02-05-1430_marketing-blog_ai-in-healthcare.txt
output/2025-02-05-1430_marketing-blog_ai-in-healthcare.json
```

## Compliance & Data Handling

All agents follow enterprise data handling rules:

- ✅ **No PII storage** - Agents don't persist personal data
- ✅ **GDPR compliant** - Data minimization principles
- ✅ **Bias detection** - Recruitment agent includes automated bias checks
- ✅ **Security rules** - No credential exposure in generated content
- ⚠️ **Human review required** - All output should be reviewed before use

See `@enterprise-agents/prompts` for full compliance rules.

## Troubleshooting

### "ANTHROPIC_API_KEY not found"

```bash
# Ensure .env file exists with your API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=your_key_here
```

### "Module not found: @enterprise-agents/core"

```bash
# Install dependencies from repo root
cd ../..
npm install

# Or from agent directory
cd agents/your-agent
npm install
```

### Agent runs but produces no output

- ✅ Check `output/` directory permissions
- ✅ Review console logs for errors
- ✅ Verify API key is valid and has credits
- ✅ Try with a simpler topic for testing

## Contributing

When adding new agents or improving existing ones:

1. Follow the established architecture pattern
2. Use TypeScript strict mode
3. Document modes and expected outputs
4. Include sample topics in README
5. Add appropriate error handling
6. Test with various input scenarios

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full guidelines.

## License

See [LICENSE.md](../LICENSE.md) for details.

---

**Built by:** Abhilash Jaiswal ([@jaiswal-abhilash](https://linkedin.com/in/jaiswal-abhilash))  
**Powered by:** [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)  
**Company:** Atos GDC India
