---
description: Generate proposals, competitive analysis, RFP responses, pitch decks, and win-loss analysis for sales engagements
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# Presales Agent Command

Generate proposals, competitive analysis, RFP responses, pitch decks, and win-loss analysis for sales engagements.

## Usage

```bash
/presales <topic> [--mode <mode>] [--context <details>]
```

## Modes

- `proposal` - Sales proposals and solutions (default)
- `competitor` - Competitive analysis and battle cards
- `rfp` - RFP/RFI response generation
- `pitch-deck` - Executive pitch deck content
- `win-loss` - Win-loss analysis and insights

## Examples

```bash
/presales Cloud migration services for retail client
/presales --mode competitor AWS vs Azure vs GCP comparison
/presales --mode rfp --context "Healthcare, HIPAA compliance, 5000 users" EHR system modernization
/presales --mode pitch-deck AI-powered customer analytics platform
```

## Output

- Console: Formatted sales content
- JSON: `agents/presales-agent/output/presales-{mode}-{timestamp}.json`
- Includes: Value props, pricing guidance, objection handlers, next steps

## Chain with

- `/marketing` → Marketing content before sales pitch
- `/recruitment` → Build team for proposed project
- `/cloud-ops` → Technical architecture for proposals
