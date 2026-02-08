---
description: Research-based professional LinkedIn content creation for thought leadership
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# LinkedIn Content Generator Command

Research-based professional LinkedIn content creation for thought leadership.

## Usage

```bash
/linkedin <topic> [--context <persona-details>]
```

## Mode

- Auto-mode (single purpose agent)

## Examples

```bash
/linkedin AI ethics in enterprise software development
/linkedin --context "CTO, fintech, 20 years experience" Cloud-native architecture evolution
```

## Output

- Console: Formatted LinkedIn post with hashtags
- JSON: `agents/linkedin-content-generator/output/linkedin-{timestamp}.json`
- Includes: Hook, body, CTA, engagement tips

## Chain with

- `/marketing` → Amplify blog content
- `/presales` → Executive thought leadership for sales
