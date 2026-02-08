# Accessibility Agent Command

Digital accessibility auditing, remediation planning, WCAG compliance, and inclusive design guidance.

## Usage

```bash
/accessibility <query> [--mode <mode>] [--context <details>]
```

## Modes

- `wcag-audit` - WCAG compliance audit (default)
- `remediation-plan` - Accessibility remediation planning
- `alt-text` - Alt text generation and review
- `aria-review` - ARIA implementation review
- `compliance-report` - A11y compliance reporting

## Examples

```bash
/accessibility Audit corporate website for WCAG 2.1 AA compliance
/accessibility --mode remediation-plan --context "E-commerce site, 500 pages, React/Next.js" Fix accessibility issues
/accessibility --mode alt-text Review product images accessibility
```

## Output

- Console: Accessibility findings and guidance
- JSON: `agents/accessibility-agent/output/accessibility-{mode}-{timestamp}.json`
- Includes: Issues, severity, remediation steps, testing checklist

## Chain with

- `/marketing` → Accessible content creation
- `/recruitment` → Inclusive job postings
- `/cloud-ops` → Accessible infrastructure
