---
description: Execute the Marketing agent to generate enterprise marketing content including blogs, social media, campaigns, press releases, and newsletters
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# Marketing Agent Command

Execute the Marketing agent to generate enterprise marketing content including blogs, social media, campaigns, press releases, and newsletters.

## Usage

```bash
/marketing <topic> [--mode <mode>] [--context <additional-context>]
```

## Modes

- `blog` - Long-form blog posts and articles (default)
- `social` - Social media content (LinkedIn, Twitter, etc.)
- `campaign` - Multi-channel marketing campaigns
- `press-release` - Press releases and announcements
- `newsletter` - Email newsletters and internal communications

## Examples

```bash
# Blog content (auto-selects mode)
/marketing AI-powered digital transformation in healthcare

# Social media content
/marketing --mode social Announcing our new cloud sustainability features

# Campaign with context
/marketing --mode campaign --context "Target: Enterprise CIOs, Budget: $50K, Duration: Q2 2026" Cloud migration services launch

# Press release
/marketing --mode press-release Company achieves SOC 2 Type II certification
```

## Implementation

When this command is invoked:

1. **Parse and analyze input**
   - Extract topic, mode, and context
   - Determine target audience and tone
   - Identify key messaging pillars

2. **Mode determination heuristics**
   - Keywords "blog", "article", "post" → `blog` mode
   - Keywords "tweet", "LinkedIn", "social" → `social` mode
   - Keywords "campaign", "launch", "promotion" → `campaign` mode
   - Keywords "press", "announcement", "media" → `press-release` mode
   - Keywords "newsletter", "email", "internal" → `newsletter` mode
   - Long topics (>10 words) → default to `blog`
   - Short topics (<5 words) → prompt for mode selection

3. **Execute agent with research pipeline**
   ```typescript
   const agentPath = join(process.cwd(), 'agents/marketing-agent');
   const mode = determinedMode;
   const topic = userTopic;

   // Marketing agent runs 4-stage pipeline:
   // 1. Research - Industry trends, keywords, audience
   // 2. Strategy - Positioning, messaging, CTAs
   // 3. Generation - Content creation
   // 4. Optimization - SEO, readability, engagement

   const cmd = `cd "${agentPath}" && npm start -- "${topic}" --mode ${mode}${context ? ` --context "${context}"` : ''}`;

   execWithProgress(cmd, {
     onStage: (stage) => logger.info(`[Marketing] ${stage}...`),
     onComplete: (output) => displayMarketingOutput(output)
   });
   ```

4. **Display results with analytics**
   - Formatted content with sections
   - **SEO insights**: Target keywords, readability score
   - **Engagement predictions**: Estimated performance
   - **Compliance check**: Brand guidelines, legal disclaimers
   - **Distribution suggestions**: Best channels, timing

5. **Post-generation actions**
   - "Export to CMS?" (WordPress, HubSpot, etc.)
   - "Generate companion content?" (Blog → Social posts)
   - "Create content calendar entry?"
   - "Schedule for review?"

## Output Format

The Marketing agent generates:
- **Console**: Formatted content with metadata
- **JSON**: `agents/marketing-agent/output/marketing-{mode}-{timestamp}.json`
  ```json
  {
    "topic": "...",
    "mode": "blog",
    "researchSummary": "...",
    "strategy": "...",
    "content": "...",
    "optimization": {
      "seo": { "keywords": [], "readability": 85 },
      "engagement": { "predicted_reach": "high" }
    },
    "generatedAt": "2026-02-08T..."
  }
  ```
- **Markdown**: Formatted file ready for publishing

## Integration with Skills

This command leverages the **marketing-expertise** skill for:
- Content strategy frameworks (AIDA, StoryBrand)
- Enterprise messaging best practices
- SEO optimization techniques
- B2B vs B2C tone guidance
- Compliance and legal considerations

## Workflow Integration

Can be chained with:
- `/presales` - Generate sales collateral after marketing content
- `/linkedin` - Create executive thought leadership from blog
- `/sustainability` - Ensure green messaging compliance

### Example Workflow: Content Campaign

```bash
# Automatic multi-asset generation
/workflow content-campaign "AI Platform Launch"

# Generates:
# 1. Blog post (thought leadership)
# 2. Social posts (3x LinkedIn, 5x Twitter)
# 3. Press release
# 4. Email newsletter
# 5. Sales enablement summary
```

## Brand Voice Customization

Add brand guidelines to `.claude/enterprise-agents/brand-voice.json`:

```json
{
  "company": "Atos",
  "industry": "Enterprise IT",
  "tone": ["professional", "innovative", "trustworthy"],
  "avoid": ["hype", "buzzwords", "oversimplification"],
  "keywords": ["digital transformation", "AI-powered", "enterprise-grade"],
  "compliance": {
    "requireLegal": ["pricing", "guarantees", "certifications"],
    "disclaimers": ["Forward-looking statements..."]
  }
}
```

## Content Quality Checks

Before finalizing:
- ✅ No unsubstantiated claims
- ✅ Proper citations for statistics
- ✅ Compliance with brand guidelines
- ✅ Readability score >70
- ✅ SEO keywords naturally integrated
- ✅ Clear CTAs included

## Advanced Features

### A/B Testing Generation
```bash
/marketing --mode social --variants 3 New AI feature launch
# Generates 3 different approaches for testing
```

### Localization
```bash
/marketing --mode blog --languages "en,es,fr" Global cloud strategy
# Generates versions in multiple languages
```

### Persona Targeting
```bash
/marketing --mode campaign --persona "IT Director, 40-55, Risk-averse" Cloud migration whitepaper
# Tailors to specific buyer persona
```

## Teaching Notes

**Key concepts you're learning:**
- **Pipeline architecture**: Research → Strategy → Generate → Optimize
- **Mode-based templating**: Different modes = different structures
- **Context enrichment**: How additional context improves output
- **Multi-stage processing**: Breaking complex tasks into stages

**Architectural insight:**
The Marketing agent doesn't just generate text - it runs a full content marketing pipeline. Each stage feeds into the next, building context and ensuring quality. This is a **dependency chain pattern** common in data processing systems.

**Try experimenting:**
1. Same topic, different modes - notice structural differences
2. Add competitor context - see how positioning changes
3. Chain with /presales - see how content adapts for sales
