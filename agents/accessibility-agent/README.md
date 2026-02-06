# Accessibility Compliance Agent

An AI-powered agent for digital accessibility auditing, WCAG compliance assessment, remediation planning, and inclusive design guidance.

## Features

- **WCAG Auditing**: Comprehensive evaluation against WCAG 2.1/2.2 success criteria
- **Remediation Planning**: Prioritized fix recommendations with code examples
- **Alt Text Generation**: Context-aware alternative text suggestions
- **ARIA Review**: WAI-ARIA implementation analysis and corrections
- **Compliance Reporting**: Detailed reports for stakeholders and certification

## Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `wcag-audit` | Full WCAG conformance audit | Pre-launch audits, annual reviews |
| `remediation-plan` | Prioritized fix roadmap | Post-audit implementation planning |
| `alt-text` | Image alternative text review | Content accessibility, image libraries |
| `aria-review` | ARIA implementation analysis | Dynamic UI components, widgets |
| `compliance-report` | Formal compliance documentation | Legal requirements, VPAT/ACR |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY
   ```

3. Run the agent:
   ```bash
   npm start -- --topic "Your accessibility topic" --mode wcag-audit
   ```

## Usage Examples

### WCAG Audit
```bash
npm start -- --topic "Audit customer portal for WCAG 2.1 AA compliance" --mode wcag-audit
```

### Remediation Plan
```bash
npm start -- --topic "Create remediation plan for 15 critical accessibility issues" --mode remediation-plan
```

### Alt Text Review
```bash
npm start -- --topic "Generate alt text for product catalog images" --mode alt-text
```

### ARIA Review
```bash
npm start -- --topic "Review ARIA implementation in modal dialogs and dropdowns" --mode aria-review
```

### Compliance Report
```bash
npm start -- --topic "Generate VPAT for enterprise SaaS platform" --mode compliance-report
```

## Pipeline Stages

1. **Scope Analysis** - Requirements and standards identification
2. **Technical Review** - Code and implementation analysis
3. **Recommendations** - Prioritized remediation guidance
4. **Compliance Verification** - Accuracy and completeness check

## Budget

| Stage | Max Budget |
|-------|------------|
| Scope Analysis | $0.50 |
| Technical Review | $1.00 |
| Recommendations | $0.75 |
| Compliance Verification | $0.25 |
| **Total** | **$2.50** |

## Standards & Frameworks

- **WCAG 2.1 / 2.2** - Web Content Accessibility Guidelines
- **Section 508** - US federal accessibility requirements
- **ADA** - Americans with Disabilities Act
- **EN 301 549** - European accessibility standard
- **WAI-ARIA** - Accessible Rich Internet Applications

## Conformance Levels

| Level | Description | Common Target |
|-------|-------------|---------------|
| A | Minimum accessibility | Rarely acceptable alone |
| AA | Standard conformance | Most legal requirements |
| AAA | Enhanced accessibility | Specialized audiences |

## Output

Generated files are saved to `output/` with:
- Timestamped filename: `2025-02-06T14-30-12_accessibility-wcag-audit_topic-slug.txt`
- Structured JSON: Same filename with `.json` extension

## Data Directory

Place accessibility-related documents in `data/`:
- `data/audits/` - Previous audit results
- `data/components/` - Component HTML/code for review
- `data/policies/` - Accessibility policies and standards
- `data/templates/` - Reporting templates

## Testing Tools Referenced

- axe DevTools / axe-core
- WAVE Web Accessibility Evaluator
- Lighthouse Accessibility Audit
- NVDA / JAWS / VoiceOver screen readers
- Color contrast analyzers
- Keyboard navigation testing

## License

MIT
