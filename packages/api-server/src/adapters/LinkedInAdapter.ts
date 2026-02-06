import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

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
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    if (mode === 'research') {
      this.emitStage(onEvent, 0, 'Trend Research', 'running');
      this.emitThinking(onEvent, 'Researching trending topics and themes...\n');
      await this.delay(700);
      this.emitStage(onEvent, 0, 'Trend Research', 'completed');

      const response = this.generateResearchResponse(topic, additionalContext);
      await this.simulateStreaming(response, onEvent);
    } else {
      this.emitStage(onEvent, 0, 'Research Phase', 'running');
      this.emitThinking(onEvent, `Researching: ${topic}\n`);
      await this.delay(500);
      this.emitStage(onEvent, 0, 'Research Phase', 'completed');

      this.emitStage(onEvent, 1, 'Post Generation', 'running');
      this.emitThinking(onEvent, 'Generating dual post variations...\n');

      const response = this.generatePostResponse(topic, additionalContext);
      await this.simulateStreaming(response, onEvent);

      this.emitStage(onEvent, 1, 'Post Generation', 'completed');
    }

    this.emitDone(onEvent);
    return '';
  }

  private generateResearchResponse(topic: string, context?: string): string {
    return `## LinkedIn Topic Research: ${topic}

### Trending Themes

Based on current LinkedIn engagement patterns, here are the top themes related to ${topic.toLowerCase()}:

| Theme | Engagement | Trend |
|-------|------------|-------|
| Leadership Insights | Very High | ↗️ Rising |
| AI/Technology | High | ↗️ Rising |
| Career Growth | High | → Stable |
| Remote Work | Medium | ↘️ Declining |
| Personal Stories | Very High | ↗️ Rising |

### Content Opportunities

**High-Engagement Formats:**
1. **Personal narratives** - Stories with lessons learned
2. **Contrarian takes** - Challenging common wisdom
3. **How-to guides** - Actionable frameworks
4. **Industry predictions** - Thought leadership
5. **Behind-the-scenes** - Authentic workplace moments

### Recommended Angles for "${topic}"

1. **The Personal Story Angle**
   - Share a personal experience related to the topic
   - Include specific numbers or outcomes
   - End with actionable advice

2. **The Contrarian Take**
   - Challenge a common belief
   - Provide evidence or reasoning
   - Invite discussion

3. **The Framework Approach**
   - Create a simple, memorable framework
   - Use numbers (3 steps, 5 principles)
   - Make it shareable

### Best Posting Times

| Day | Time (EST) | Engagement |
|-----|------------|------------|
| Tuesday | 8-10 AM | Highest |
| Wednesday | 9-11 AM | High |
| Thursday | 8-9 AM | High |
| LinkedIn Best Practice | 7:30-8:30 AM | Peak |

### Hashtag Recommendations

**Primary (use 2-3):**
#Leadership #CareerGrowth #ProfessionalDevelopment

**Secondary (use 1-2):**
#FutureOfWork #Innovation #${topic.replace(/\s+/g, '')}

### Engagement Tips

- ✅ Ask questions at the end
- ✅ Use line breaks for readability
- ✅ Include a hook in first line
- ✅ Respond to comments within 1 hour
- ✅ Tag relevant people (sparingly)

${context ? `\n**Research Context:** ${context}` : ''}`;
  }

  private generatePostResponse(topic: string, context?: string): string {
    return `## LinkedIn Posts: ${topic}

### Post Variation A: Professional/Analytical

---

**Hook Line:**
Most people approach ${topic.toLowerCase()} completely wrong.

Here's what I've learned after 10 years in the industry:

**The Problem:**
We've been taught to [common approach], but this often leads to [negative outcome].

**The Shift:**
After studying top performers, I noticed they do something different:

1️⃣ **Start with Why**
They understand the deeper purpose before diving in.

2️⃣ **Embrace Imperfection**
Progress > perfection. Always.

3️⃣ **Build Systems, Not Goals**
Goals are temporary. Systems create lasting change.

4️⃣ **Measure What Matters**
Focus on leading indicators, not just outcomes.

**The Result:**
When I applied these principles, I saw:
• 40% improvement in efficiency
• Reduced stress and burnout
• Better team engagement

**Your Turn:**
What's one principle you'd add to this list?

Drop it in the comments 👇

---

#Leadership #PersonalGrowth #${topic.replace(/\s+/g, '')} #CareerAdvice

---

### Post Variation B: Personal Story/Emotional

---

**Hook Line:**
3 years ago, I almost gave up on ${topic.toLowerCase()}.

Here's the story:

I was struggling. Hard.

Despite putting in 60+ hours a week, nothing was working. My team was frustrated. I was frustrated.

Then my mentor said something that changed everything:

"You're optimizing for the wrong thing."

That hit me.

I realized I was focused on [wrong thing] when I should have been focused on [right thing].

**The Transformation:**

I made one simple change:
→ Instead of [old approach], I started [new approach]

Within 3 months:
✅ Team morale improved
✅ Results started showing
✅ I found joy in my work again

**The Lesson:**

Sometimes the best thing you can do is step back and question your assumptions.

What you've always done isn't always what you should keep doing.

**My challenge to you:**

This week, take 30 minutes to examine ONE assumption you've been holding about ${topic.toLowerCase()}.

You might be surprised what you find.

---

*What assumptions have you challenged recently? Share below* 💬

#CareerGrowth #LeadershipLessons #ProfessionalDevelopment #Mindset

---

### Engagement Optimization Tips

**For Post A:**
- Best for: Thought leadership positioning
- Ideal audience: Mid-senior professionals
- Expected engagement: 2-3% (comments)

**For Post B:**
- Best for: Building connection and relatability
- Ideal audience: Broad professional audience
- Expected engagement: 3-5% (likes + comments)

### Posting Strategy

1. Post between 7:30-8:30 AM EST (Tuesday-Thursday)
2. Engage with comments in first 60 minutes
3. Add a follow-up comment with additional value
4. Cross-post to Twitter/X with modified format

${context ? `\n**Post Context:** ${context}` : ''}`;
  }
}
