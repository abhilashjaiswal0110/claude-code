import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const PERSONA = `You are writing as Abhilash Jaiswal — GenAI Lead, Future-ready CTO, Patent Holder at Atos GDC India.
LinkedIn: https://in.linkedin.com/in/jaiswal-abhilash

Writing style: Professional, authoritative, thought-leadership tone. Uses specific numbers and real-world examples.
Blends technical depth with business impact. Encourages conversation without being salesy.
Uses white space and emojis sparingly for readability.`;

export class LinkedInAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'linkedin-content-generator',
    name: 'LinkedIn Generator',
    description: 'Research topics and generate dual LinkedIn post variations with engagement optimization',
    category: 'Content',
    modes: [
      { id: 'research', label: 'Research', description: 'Research trending topics' },
      { id: 'generate', label: 'Generate Posts', description: 'Generate post variations' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    if (mode === 'research') {
      this.emitStage(onEvent, 0, 'Trend Research', 'running');
      this.emitThinking(onEvent, 'Analysing LinkedIn engagement patterns and trending angles for your topic...\n');

      const systemPrompt = `${PERSONA}

You are a LinkedIn content strategist. Your task is to analyse a given topic and provide:
1. Trending themes related to the topic with estimated engagement levels
2. High-engagement content formats that would work for this topic
3. Specific angles the author could take
4. Hashtag recommendations (primary and secondary)
5. Best posting times (days and time slots)

Be specific to the topic provided. Do NOT give generic advice — tailor everything to the exact topic.
Format using Markdown with tables where appropriate.`;

      const userMessage = `Topic: "${topic}"${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}

Provide a comprehensive LinkedIn content research brief for this topic.`;

      const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent, 4096, signal);
      this.emitStage(onEvent, 0, 'Trend Research', 'completed');
      this.emitDone(onEvent);
      return response;

    } else {
      this.emitStage(onEvent, 0, 'Research Phase', 'running');
      this.emitThinking(onEvent, `Analysing topic angles and audience insights for: ${topic}\n`);
      this.emitStage(onEvent, 0, 'Research Phase', 'completed');

      this.emitStage(onEvent, 1, 'Post Generation', 'running');
      this.emitThinking(onEvent, 'Generating two high-engagement LinkedIn post variations...\n');

      const systemPrompt = `${PERSONA}

Generate TWO distinct LinkedIn post variations for the given topic:

**Post Variation A — Hook-Focused / Analytical:**
- Starts with a bold, counterintuitive statement or surprising insight
- Uses numbered lists or frameworks
- Targets mid-senior professionals
- Ends with a thought-provoking question

**Post Variation B — Story-Driven / Personal:**
- Opens with a personal experience or turning point
- Builds narrative tension before the lesson
- More conversational tone
- Ends with a call-to-action or challenge to the reader

For each post include:
- The full post text (LinkedIn-ready, copy-paste format)
- 3–5 relevant hashtags
- Estimated character count
- Best posting time recommendation

Make the content SPECIFIC to the topic — avoid generic career advice templates.`;

      const userMessage = `Topic: "${topic}"${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}

Generate two LinkedIn post variations as Abhilash Jaiswal.`;

      const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent, 4096, signal);
      this.emitStage(onEvent, 1, 'Post Generation', 'completed');
      this.emitDone(onEvent);
      return response;
    }
  }
}
