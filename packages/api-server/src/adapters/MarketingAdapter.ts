import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Senior Marketing & Communications Strategist at Atos, a global IT services company.
You craft compelling B2B content that balances technical depth with business impact.
You understand enterprise buyer journeys, thought leadership positioning, and digital marketing.
Format output with clear Markdown structure. Provide copy-ready content wherever possible.`;

const MODE_PROMPTS: Record<string, string> = {
  blog: `${SYSTEM_BASE}

Create a complete, SEO-optimised blog post. Include:
- Compelling headline (with SEO keyword)
- Executive summary (2-3 sentences)
- Introduction with a hook
- 3-5 structured sections with subheadings
- Real-world examples or statistics
- Conclusion with clear CTA
- Meta description (155 chars)
- 5 SEO tags`,

  social: `${SYSTEM_BASE}

Create social media content for multiple platforms. For each:
- LinkedIn post (professional, 150-300 words, with hashtags)
- Twitter/X thread (5-7 tweets)
- Instagram caption (casual, with relevant emojis and hashtags)
Tailor tone to each platform's audience.`,

  campaign: `${SYSTEM_BASE}

Design a complete marketing campaign brief. Include:
- Campaign objective and KPIs
- Target audience persona
- Key messages (3-5 pillars)
- Channel mix with rationale
- Content calendar outline (4-week)
- Budget allocation guidance
- Success metrics and measurement plan`,

  'press-release': `${SYSTEM_BASE}

Write a professional press release in AP Style. Include:
- Headline and dateline
- Lead paragraph (who, what, when, where, why)
- Supporting paragraphs with quotes
- Boilerplate company description
- Media contact information placeholder
- End marker "###"`,

  newsletter: `${SYSTEM_BASE}

Create an engaging email newsletter. Include:
- Subject line (A/B test variant)
- Preview text
- Hero section with main story
- 3-4 shorter content blocks
- Featured resource/CTA
- Footer with unsubscribe note
Keep total reading time under 3 minutes.`,
};

export class MarketingAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'marketing',
    name: 'Marketing Agent',
    description: 'Blog posts, social content, campaign briefs, press releases, and newsletters',
    category: 'Marketing',
    modes: [
      { id: 'blog', label: 'Blog Post', description: 'Write SEO blog content' },
      { id: 'social', label: 'Social Media', description: 'Multi-platform social content' },
      { id: 'campaign', label: 'Campaign', description: 'Full campaign brief' },
      { id: 'press-release', label: 'Press Release', description: 'Formal press release' },
      { id: 'newsletter', label: 'Newsletter', description: 'Email newsletter' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Brief Analysis', 'running');
    this.emitThinking(onEvent, `Analysing content brief for ${mode} format...\n`);
    this.emitStage(onEvent, 0, 'Brief Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Content Creation', 'running');
    this.emitThinking(onEvent, 'Generating content...\n');

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['blog'];
    const userMessage = `Topic/Brief: "${topic}"${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent);

    this.emitStage(onEvent, 1, 'Content Creation', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
