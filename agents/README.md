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

## Testing & Validation

### Quick Test Commands

Each agent can be quickly tested with sample prompts to verify functionality:

#### HR Agent
```bash
cd agents/hr-agent

# Test default mode (policy)
npm start "What is the work from home policy?"

# Test all modes
npm start -- --mode benefits "What health insurance options are available?"
npm start -- --mode engagement "Analyze Q4 engagement survey results"
npm start -- --mode onboarding "New software engineer joining cloud team"
npm start -- --mode exit-interview "Summarize exit interview trends Q3-Q4"
```

**Expected Output Structure:**
- Classification of query type and sensitivity
- Policy search results with document references
- Comprehensive response with step-by-step guidance
- Compliance check with disclaimers
- Output files: `.txt` (formatted) and `.json` (structured)

#### Marketing Agent
```bash
cd agents/marketing-agent

# Test blog mode (default)
npm start "AI in Enterprise Digital Transformation"

# Test other modes
npm start -- --mode social "Cloud Security Trends 2025"
npm start -- --mode campaign "Hybrid Cloud Migration Services"
npm start -- --mode press-release "Partnership Announcement"
npm start -- --mode newsletter "January Tech Insights"
```

**Expected Output Structure:**
- Research summary with market data and trends
- Content strategy and messaging framework
- Full content generation (2,500+ words for blog)
- SEO optimization with keywords and meta descriptions
- Output saved in both formats with topic slug

#### Recruitment Agent
```bash
cd agents/recruitment-agent

# Test job description mode
npm start "Senior Cloud Solutions Architect"

# Test other modes
npm start -- --mode screening "Full Stack Developer - React and Node.js"
npm start -- --mode interview "Data Science Lead - ML Engineering"
npm start -- --mode comparison "3 finalists for VP Engineering role"
npm start -- --mode offer "Senior Software Engineer - London office"
```

**Expected Output Structure:**
- Role understanding and market context
- Comprehensive content (job description, questions, framework)
- **Bias & compliance check** (automatic):
  - ✓ No gendered language detected
  - ✓ No age-indicative terms found
  - ✓ Equal opportunity statement included
  - ✓ GDPR-compliant data handling
  - ⚠️ Suggestions for improvement
- Salary benchmarks and competitive data

#### IT Operations Agent
```bash
cd agents/it-operations-agent

# Test incident mode
npm start "Production API returning 500 errors intermittently"

# Test other modes
npm start -- --mode kb-search "Search KB for known issue with 500 errors"
npm start -- --mode root-cause "Investigate root cause of database latency"
npm start -- --mode status-report "Generate status report for production environment"
npm start -- --mode runbook "Write runbook for database failover"
```

**Expected Output Structure:**
- Incident severity classification (P0-P3)
- Immediate actions with specific commands
- Investigation steps and probable causes
- Resolution steps and rollback procedures
- Prevention recommendations

#### Presales Agent
```bash
cd agents/presales-agent

# Test proposal mode
npm start "Cloud migration services for financial institution"

# Test other modes
npm start -- --mode competitor "Compare our cloud offering vs AWS"
npm start -- --mode rfp "Government agency cloud infrastructure RFP"
npm start -- --mode pitch-deck "Series B fundraising deck"
npm start -- --mode win-loss "Analyze deals won and lost in Q4"
```

**Expected Output Structure:**
- Client situation analysis
- Proposed solution architecture
- Implementation timeline and phases
- Team structure and pricing ($X.XM - $Y.YM)
- Success metrics and KPIs
- Competitive differentiation (for competitor mode)

#### Learning & Development Agent
```bash
cd agents/learning-dev-agent

# Test skill gap mode
npm start "Frontend team needs to learn TypeScript"

# Test other modes
npm start -- --mode learning-path "Junior developer to senior engineer"
npm start -- --mode training "Cloud security workshop"
npm start -- --mode assessment "Test React knowledge for developers"
npm start -- --mode team-matrix "Skill inventory for engineering team"
```

**Expected Output Structure:**
- Current skill assessment
- Gap analysis with priority ranking
- Learning resources (courses, books, certifications)
- Implementation timeline (weeks/months)
- Success metrics and checkpoints

#### LinkedIn Content Generator
```bash
cd agents/linkedin-content-generator

# Test with various topics
npm start "AI and the future of work"
npm start "Building high-performing engineering teams"
npm start "Cloud cost optimization strategies"
```

**Expected Output Structure:**
- Research summary with current trends
- Two post variations:
  1. **Hook-focused** (engagement-optimized)
  2. **Value-focused** (educational thread-style)
- Image suggestions with descriptions
- Optimal posting schedule (days, times)
- Character count and hashtag recommendations

#### Sustainability Agent
```bash
cd agents/sustainability-agent

# Test carbon footprint mode
npm start "Calculate cloud infrastructure emissions"

# Test other modes
npm start -- --mode green-it "Optimize data center energy efficiency"
npm start -- --mode sustainability-report "Annual ESG report"
npm start -- --mode energy-optimization "Renewable energy integration"
npm start -- --mode esg-compliance "EU CSRD compliance assessment"
```

**Expected Output Structure:**
- GHG Protocol-aligned emissions calculation
- Scope 1, 2, 3 breakdown
- Reduction recommendations with ROI
- Compliance framework mapping (GRI, CDP, TCFD)
- Industry benchmarking

#### Accessibility Agent
```bash
cd agents/accessibility-agent

# Test WCAG audit mode
npm start "Audit e-commerce website for WCAG 2.1 AA"

# Test other modes
npm start -- --mode remediation-plan "Fix admin dashboard issues"
npm start -- --mode alt-text "Generate alt text for product images"
npm start -- --mode aria-review "Review form accessibility"
npm start -- --mode compliance-report "VPAT 2.4 Rev 508 documentation"
```

**Expected Output Structure:**
- WCAG 2.1/2.2 conformance analysis
- Issues categorized by severity (A, AA, AAA)
- Prioritized remediation roadmap
- Code examples for fixes
- Compliance documentation (VPAT/ACR format)

#### Cloud Operations Agent
```bash
cd agents/cloud-ops-agent

# Test cost optimization mode
npm start "Reduce AWS spend by 30%"

# Test other modes
npm start -- --mode incident-response "Multi-region outage postmortem"
npm start -- --mode capacity-planning "Scale for 300% growth"
npm start -- --mode architecture-review "Well-Architected assessment"
npm start -- --mode migration-assessment "On-prem to AWS migration"
```

**Expected Output Structure:**
- FinOps-aligned cost analysis
- Savings opportunities with priority ($X,XXX/month)
- Implementation steps with risk assessment
- Architecture recommendations (Well-Architected Framework)
- Migration strategy using 6Rs methodology

### Automated Testing

You can create test scripts to validate agent behavior:

**test-agents.sh** (Bash/macOS/Linux):
```bash
#!/bin/bash

echo "Testing Enterprise Agents..."

# Test HR Agent
cd agents/hr-agent
echo "✓ Testing HR Agent..."
npm start "What is the vacation policy?" > /dev/null 2>&1 && echo "  ✓ HR Agent working" || echo "  ✗ HR Agent failed"

# Test Marketing Agent
cd ../marketing-agent
echo "✓ Testing Marketing Agent..."
npm start "AI trends" > /dev/null 2>&1 && echo "  ✓ Marketing Agent working" || echo "  ✗ Marketing Agent failed"

# Test Recruitment Agent
cd ../recruitment-agent
echo "✓ Testing Recruitment Agent..."
npm start "Software Engineer" > /dev/null 2>&1 && echo "  ✓ Recruitment Agent working" || echo "  ✗ Recruitment Agent failed"

echo "✓ All agent tests complete"
```

**test-agents.ps1** (PowerShell/Windows):
```powershell
Write-Host "Testing Enterprise Agents..."

# Test HR Agent
Set-Location agents/hr-agent
Write-Host "Testing HR Agent..."
npm start "What is the vacation policy?" *> $null
if ($LASTEXITCODE -eq 0) { Write-Host "  ✓ HR Agent working" -ForegroundColor Green } 
else { Write-Host "  ✗ HR Agent failed" -ForegroundColor Red }

# Test Marketing Agent
Set-Location ../marketing-agent
Write-Host "Testing Marketing Agent..."
npm start "AI trends" *> $null
if ($LASTEXITCODE -eq 0) { Write-Host "  ✓ Marketing Agent working" -ForegroundColor Green }
else { Write-Host "  ✗ Marketing Agent failed" -ForegroundColor Red }

# Test Recruitment Agent
Set-Location ../recruitment-agent
Write-Host "Testing Recruitment Agent..."
npm start "Software Engineer" *> $null
if ($LASTEXITCODE -eq 0) { Write-Host "  ✓ Recruitment Agent working" -ForegroundColor Green }
else { Write-Host "  ✗ Recruitment Agent failed" -ForegroundColor Red }

Write-Host "✓ All agent tests complete"
```

### Output Validation

Verify agent outputs match expected structure:

```bash
# Check JSON structure
cat agents/hr-agent/output/<latest>.json | jq 'has("topic", "mode", "classification", "response")'
# Should return: true

# Verify output completeness
cat agents/marketing-agent/output/<latest>.json | jq '.content | length'
# Should return: > 2000 (characters for blog mode)

# Check compliance data
cat agents/recruitment-agent/output/<latest>.json | jq '.biasCheck'
# Should contain bias detection results

# Validate timestamps
cat agents/presales-agent/output/<latest>.json | jq '.generatedAt'
# Should return ISO 8601 timestamp
```

### Performance Testing

Monitor agent execution time and costs:

```bash
# Time execution
time npm start "Test topic"

# Check pipeline stages and turns
npm start "Test topic" 2>&1 | grep -E "(Stage|Turn|Budget)"

# Monitor API usage
# Add to .env: ANTHROPIC_LOG_LEVEL=debug
npm start "Test topic" 2>&1 | grep "API call"
```

### Integration Testing

Test agents in realistic workflows:

**Complete Recruitment Workflow:**
```bash
cd agents/recruitment-agent

# 1. Job description
npm start -- --mode jd "Senior DevOps Engineer" 

# 2. Screening framework
npm start -- --mode screening "Senior DevOps Engineer"

# 3. Interview questions
npm start -- --mode interview "Senior DevOps Engineer"

# 4. Candidate comparison
npm start -- --mode comparison "3 DevOps finalists"

# 5. Offer letter
npm start -- --mode offer "Senior DevOps Engineer - NYC"

# Verify all outputs created
ls -la output/ | wc -l
# Should show 5+ files (txt + json for each mode)
```

**Marketing Campaign Workflow:**
```bash
cd agents/marketing-agent

# Blog → Social → Press Release → Newsletter
for mode in blog social press-release newsletter; do
  npm start -- --mode $mode "AI Platform Launch"
done

# Verify comprehensive campaign assets
ls -la output/
# Should show 8 files (4 txt + 4 json)
```

### Troubleshooting Tests

**Agent Not Running:**
```bash
# Check Node.js version
node --version  # Should be 18.0.0+

# Verify dependencies
npm list @anthropic-ai/sdk
# Should show installed version

# Check API key (without exposing value)
[ -z "$ANTHROPIC_API_KEY" ] && echo "ANTHROPIC_API_KEY is not set" || echo "ANTHROPIC_API_KEY is set"  # Linux/macOS
if (-not $env:ANTHROPIC_API_KEY) { Write-Host "ANTHROPIC_API_KEY is not set" } else { Write-Host "ANTHROPIC_API_KEY is set" }  # Windows PowerShell
```

**Empty or Incomplete Output:**
```bash
# Enable debug logging
export ANTHROPIC_LOG_LEVEL=debug  # Linux/macOS
$env:ANTHROPIC_LOG_LEVEL="debug"  # Windows PowerShell

npm start "Test topic"
# Review detailed execution logs
```

**Budget Exceeded:**
```bash
# Check stage budgets in src/prompts.ts
grep -r "maxBudgetUsd" src/

# Reduce turn limits for testing
# Edit src/prompts.ts and reduce maxTurns values
```

### Continuous Integration

Add to CI/CD pipeline:

```yaml
# .github/workflows/test-agents.yml
name: Test Enterprise Agents

on: [push, pull_request]

jobs:
  test-agents:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        agent: [hr-agent, marketing-agent, recruitment-agent]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd agents/${{ matrix.agent }}
          npm install
      
      - name: Test agent
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          cd agents/${{ matrix.agent }}
          npm start "Test topic" > output.txt
          
      - name: Validate output
        run: |
          cd agents/${{ matrix.agent }}
          test -f output/*.json || exit 1
          test -f output/*.txt || exit 1
```

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
