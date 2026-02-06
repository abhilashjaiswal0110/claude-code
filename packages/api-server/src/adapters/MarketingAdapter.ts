import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class MarketingAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'marketing-agent',
    name: 'Marketing',
    description: 'Blog posts, social media content, campaign briefs, press releases, and newsletter drafts',
    category: 'Marketing',
    modes: [
      { id: 'blog', label: 'Blog Post', description: 'Write blog posts and articles' },
      { id: 'social', label: 'Social Media', description: 'Create social media content' },
      { id: 'campaign', label: 'Campaign', description: 'Develop campaign briefs' },
      { id: 'press-release', label: 'Press Release', description: 'Draft press releases' },
      { id: 'newsletter', label: 'Newsletter', description: 'Write newsletter content' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    // Stage 1: Research & Planning
    this.emitStage(onEvent, 0, 'Research & Planning', 'running');
    this.emitThinking(onEvent, `Researching topic and audience for ${mode}...\n`);
    await this.delay(600);
    this.emitStage(onEvent, 0, 'Research & Planning', 'completed');

    // Stage 2: Content Generation
    this.emitStage(onEvent, 1, 'Content Generation', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 1, 'Content Generation', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      blog: `# ${topic}

*Reading time: 5 minutes*

## Introduction

In today's rapidly evolving business landscape, ${topic.toLowerCase()} has become more crucial than ever. Organizations that embrace this trend are seeing remarkable results.

## Why This Matters

The importance of ${topic.toLowerCase()} cannot be overstated:

1. **Competitive Advantage** - Early adopters are already reaping benefits
2. **Customer Expectations** - Modern customers demand better experiences
3. **Operational Efficiency** - Streamlined processes lead to cost savings

## Key Insights

### The Current State

According to recent industry research, over 70% of organizations are actively investing in similar initiatives. The trend shows no signs of slowing down.

### Best Practices

To successfully implement ${topic.toLowerCase()}, consider:

- Start with a clear strategy and measurable goals
- Involve stakeholders from the beginning
- Iterate based on feedback and data
- Invest in the right tools and training

## Real-World Example

A leading enterprise recently transformed their approach to ${topic.toLowerCase()}. Within six months, they achieved:
- 40% improvement in efficiency
- 25% cost reduction
- 90% stakeholder satisfaction

## Conclusion

The time to act on ${topic.toLowerCase()} is now. Organizations that wait risk falling behind competitors who are already making strides.

---
*Ready to learn more? Contact our team for a personalized consultation.*

${context ? `\n**Author Notes:** ${context}` : ''}`,

      social: `## Social Media Content: ${topic}

### LinkedIn Post (Professional)

🚀 **Exciting insights on ${topic}!**

We've been exploring how forward-thinking organizations are approaching this challenge, and the results are impressive.

Key takeaways:
✅ 40% efficiency gains
✅ Improved team collaboration
✅ Better customer outcomes

What's your organization doing in this space? Share your thoughts below! 👇

#Innovation #BusinessStrategy #DigitalTransformation #Leadership

---

### Twitter/X Thread

🧵 Thread on ${topic}:

1/ Here's what we've learned about ${topic.toLowerCase()} from working with leading organizations...

2/ The biggest mistake? Waiting too long to start. Early movers are seeing 2-3x better results than late adopters.

3/ Top 3 success factors:
• Clear vision
• Stakeholder buy-in
• Iterative approach

4/ The best part? You don't need a massive budget to begin. Start small, learn fast.

5/ What's holding you back from taking action? Reply and let's discuss! 💬

---

### Instagram Caption

✨ ${topic} is transforming how we work.

Swipe to see the key trends shaping the future of business →

💡 Pro tip: Start with one small initiative and scale from there.

Double tap if you agree! ❤️

#BusinessInsights #FutureOfWork #Innovation

${context ? `\n**Campaign Context:** ${context}` : ''}`,

      campaign: `## Campaign Brief: ${topic}

### Campaign Overview

| Field | Details |
|-------|---------|
| Campaign Name | ${topic} |
| Duration | 8 weeks |
| Budget | TBD |
| Target Audience | Decision-makers, C-suite |

### Objectives

**Primary Goal:** Generate awareness and qualified leads for ${topic.toLowerCase()}

**KPIs:**
- Brand awareness: +30%
- Lead generation: 500 MQLs
- Engagement rate: 5%+
- Conversion rate: 3%+

### Target Audience

**Primary Persona:** Enterprise Decision Maker
- Age: 35-55
- Role: Director+
- Challenges: Efficiency, innovation, competitive pressure
- Channels: LinkedIn, industry publications, events

### Key Messages

1. **Value Proposition:** Transform your operations with ${topic.toLowerCase()}
2. **Differentiator:** Proven methodology with measurable results
3. **CTA:** Schedule a consultation to learn more

### Channel Strategy

| Channel | Purpose | Content Type |
|---------|---------|--------------|
| LinkedIn | Thought leadership | Articles, videos |
| Email | Nurture | Educational series |
| Webinars | Engagement | Live demos |
| Paid Search | Capture intent | Landing pages |

### Timeline

**Week 1-2:** Pre-launch prep, asset creation
**Week 3-4:** Soft launch, testing
**Week 5-6:** Full launch, optimization
**Week 7-8:** Scaling, performance review

### Success Metrics

Campaign success will be measured by:
- Lead quality score
- Sales pipeline contribution
- Brand lift study results
- ROI analysis

${context ? `\n**Additional Requirements:** ${context}` : ''}`,

      'press-release': `## PRESS RELEASE

### FOR IMMEDIATE RELEASE

**${topic}**

*[City, Date]* — [Company Name], a leading provider of enterprise solutions, today announced ${topic.toLowerCase()}.

### Key Highlights

"This represents a significant milestone for our organization and customers," said [Executive Name], [Title]. "We're committed to delivering innovative solutions that drive real business value."

### The Announcement

[Detailed description of the announcement, including:
- What is being announced
- Why it matters
- Who benefits
- When it takes effect]

### Industry Impact

Industry analysts predict this development will have far-reaching implications. "${topic} demonstrates the company's commitment to innovation," noted [Analyst Name] of [Research Firm].

### Customer Perspective

"We've been waiting for exactly this kind of solution," said [Customer Name], [Title] at [Customer Company]. "The potential impact on our operations is significant."

### About [Company Name]

[Company Name] is a leader in [industry/sector], serving [number] customers worldwide. For more information, visit [website].

### Media Contact

[Name]
[Title]
[Email]
[Phone]

###

${context ? `\n**PR Notes:** ${context}` : ''}`,

      newsletter: `## Newsletter: ${topic}

### Subject Line Options
1. "Your monthly update: ${topic} and more"
2. "Don't miss: Key insights on ${topic}"
3. "What you need to know about ${topic}"

---

# Monthly Newsletter

## This Month's Spotlight: ${topic}

Dear [First Name],

Happy [Month]! We're excited to share the latest updates and insights with you.

### 🎯 Featured: ${topic}

This month, we're diving deep into ${topic.toLowerCase()}. Here's what you need to know:

**Why it matters:** Organizations embracing this trend are seeing significant improvements in efficiency and outcomes.

**Key takeaway:** Start small, measure results, and scale what works.

[Read the full article →]

---

### 📊 By the Numbers

| Metric | This Month |
|--------|------------|
| Industry growth | +15% |
| Adoption rate | 65% |
| Satisfaction | 92% |

---

### 🗓 Upcoming Events

**Webinar: Deep Dive into ${topic}**
- Date: [Next Tuesday]
- Time: 2 PM EST
- [Register now →]

**Industry Conference**
- Date: [Next Month]
- Location: Virtual
- [Learn more →]

---

### 💡 Quick Tips

1. Review your current processes
2. Identify quick wins
3. Set measurable goals
4. Track and iterate

---

### 📚 Resources

- [Guide: Getting Started with ${topic}]
- [Case Study: Success Stories]
- [Template: Implementation Checklist]

---

Thanks for reading! Reply to this email with any questions.

Best regards,
The Team

${context ? `\n**Editor Notes:** ${context}` : ''}`,
    };

    return responses[mode] || responses['blog'];
  }
}
