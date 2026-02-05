/**
 * Stage prompts for Marketing & Communication Agent
 */

import { ATOS_COMPANY_CONTEXT, ATOS_DIFFERENTIATORS } from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { MARKETING_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { MarketingMode } from './types.js';

const personaContext = buildPersonaContext(MARKETING_PERSONA);

const MODE_INSTRUCTIONS: Record<MarketingMode, string> = {
  blog: `Generate a long-form technical blog post (1500-2500 words) including:
- Compelling headline and subheadline
- Introduction with hook and thesis
- 4-6 structured sections with subheadings
- Data points, examples, and expert insights
- Conclusion with call to action
- SEO keywords and meta description
- Estimated read time`,

  social: `Generate a 1-week social media content calendar including:
- 5 posts across LinkedIn, Twitter/X, and relevant platforms
- Each post with: platform, date/time, content text, hashtags, media suggestion
- Mix of content types: thought leadership, data insights, engagement questions, company news
- Platform-specific formatting and character limits
- Optimal posting times for B2B tech audience`,

  campaign: `Generate a comprehensive campaign brief including:
- Campaign objective and goals
- Target audience personas
- Key messaging framework (primary message, supporting points, proof points)
- Channel strategy with rationale
- Content calendar timeline (4-6 weeks)
- KPIs and measurement plan
- Budget allocation recommendations`,

  'press-release': `Generate an AP-style press release including:
- Headline (under 80 characters)
- Subheadline
- Dateline and lead paragraph (who, what, when, where, why)
- Supporting paragraphs with quotes
- Boilerplate company description
- Media contact placeholder
- ### end mark`,

  newsletter: `Generate an email newsletter including:
- 3 subject line variations (A/B test ready)
- Preheader text
- Opening section with hook
- 2-3 content sections with clear hierarchy
- Call-to-action buttons/links
- Footer content
- Plain text alternative`,
};

export function buildStages(mode: MarketingMode): StageConfig[] {
  return [
    {
      name: 'Research',
      description: 'Research trends, data, and competitive landscape',
      systemPromptAppend: `You are a marketing research analyst for Atos. ${personaContext}`,
      allowedTools: ['WebSearch'],
      maxTurns: 15,
      maxBudgetUsd: 2.0,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

Research the following topic for a ${mode} content piece:

TOPIC: ${ctx.topic}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Gather:
1. Current trends and recent developments (last 6-12 months)
2. Key statistics and market data
3. Competitor messaging and positioning on this topic
4. Target audience pain points and interests
5. Relevant Atos capabilities and differentiators
6. SEO keywords and search intent

Compile a comprehensive research brief for content creation.`,
    },
    {
      name: 'Strategy',
      description: 'Develop content strategy and messaging framework',
      systemPromptAppend: `You are a senior content strategist. ${personaContext}`,
      allowedTools: [],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${ATOS_DIFFERENTIATORS}

Based on this research:
${ctx.previousResults['Research']}

TOPIC: ${ctx.topic}
CONTENT TYPE: ${mode}

Develop a content strategy including:
1. Key messaging angle and unique perspective
2. Target audience and their needs
3. Content structure and flow
4. Tone and voice calibration
5. Key differentiators to highlight
6. Call-to-action strategy

Be specific and actionable. This strategy will guide the content generation.`,
    },
    {
      name: 'Generation',
      description: `Generate ${mode} content`,
      systemPromptAppend: `You are an expert B2B content writer for Atos. ${personaContext}`,
      allowedTools: [],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${personaContext}

RESEARCH:
${ctx.previousResults['Research']}

STRATEGY:
${ctx.previousResults['Strategy']}

TOPIC: ${ctx.topic}
CONTENT TYPE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Write the content now. Make it publication-ready with proper formatting.
Maintain the Atos brand voice throughout.`,
    },
    {
      name: 'Optimization',
      description: 'SEO optimization and scheduling recommendations',
      systemPromptAppend: 'You are a digital marketing optimization specialist.',
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Review the following ${mode} content and provide optimization recommendations:

CONTENT:
${ctx.previousResults['Generation']}

Provide:
1. SEO optimization suggestions (keywords, meta tags, readability score)
2. Optimal publishing schedule and timing
3. Distribution channel recommendations
4. A/B testing suggestions for headlines or CTAs
5. Performance tracking KPIs
6. Content repurposing opportunities

Be specific and actionable.`,
    },
  ];
}
