import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class PresalesAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'presales-agent',
    name: 'Presales',
    description: 'Proposals, competitor analysis, RFP responses, pitch decks, and win-loss analysis',
    category: 'Sales',
    modes: [
      { id: 'proposal', label: 'Proposal', description: 'Draft sales proposals' },
      { id: 'competitor', label: 'Competitor', description: 'Analyze competitors' },
      { id: 'rfp', label: 'RFP Response', description: 'Respond to RFPs' },
      { id: 'pitch-deck', label: 'Pitch Deck', description: 'Create pitch deck content' },
      { id: 'win-loss', label: 'Win-Loss', description: 'Analyze deal outcomes' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Market Research', 'running');
    this.emitThinking(onEvent, `Researching market context for ${mode}...\n`);
    await this.delay(600);
    this.emitStage(onEvent, 0, 'Market Research', 'completed');

    this.emitStage(onEvent, 1, 'Content Development', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 1, 'Content Development', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      proposal: `## Sales Proposal: ${topic}

### Executive Summary

We are pleased to present this proposal for ${topic.toLowerCase()}. Based on our understanding of your requirements, we have developed a comprehensive solution that addresses your key challenges while delivering measurable business value.

### Understanding Your Challenges

Based on our discovery conversations, we understand your organization is facing:

1. **Challenge 1:** Need for improved operational efficiency
2. **Challenge 2:** Requirements for scalable growth
3. **Challenge 3:** Pressure to reduce costs while improving quality

### Proposed Solution

Our solution provides a comprehensive approach:

| Component | Description | Value |
|-----------|-------------|-------|
| Core Platform | Enterprise-grade solution | Foundation |
| Integration | Seamless connectivity | Efficiency |
| Analytics | Real-time insights | Intelligence |
| Support | 24/7 expert assistance | Reliability |

### Investment & ROI

**Investment Summary:**
| Item | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| Platform | $150,000 | $100,000 | $100,000 |
| Services | $50,000 | $25,000 | $25,000 |
| **Total** | **$200,000** | **$125,000** | **$125,000** |

**Expected ROI:**
- Break-even: 14 months
- 3-year ROI: 250%
- Annual savings: $180,000

### Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Discovery | 2 weeks | Requirements document |
| Design | 4 weeks | Solution architecture |
| Build | 8 weeks | Configured platform |
| Deploy | 2 weeks | Go-live support |
| Optimize | 4 weeks | Performance tuning |

### Why Choose Us

- ✅ 15+ years industry experience
- ✅ 500+ successful implementations
- ✅ 98% customer satisfaction rate
- ✅ Award-winning support team

### Next Steps

1. Schedule technical deep-dive
2. Finalize requirements
3. Contract negotiation
4. Kick-off planning

${context ? `\n**Proposal Notes:** ${context}` : ''}`,

      competitor: `## Competitor Analysis: ${topic}

### Competitive Landscape Overview

| Competitor | Market Share | Strength | Weakness |
|------------|--------------|----------|----------|
| Competitor A | 25% | Brand recognition | High cost |
| Competitor B | 20% | Feature-rich | Complex |
| Competitor C | 15% | Low cost | Limited support |
| **Us** | 18% | Value + service | Brand awareness |

### Detailed Analysis

#### Competitor A - Market Leader
**Positioning:** Premium enterprise solution

**Strengths:**
- Strong brand recognition
- Comprehensive feature set
- Global presence

**Weaknesses:**
- 40% higher pricing
- Long implementation cycles
- Rigid contracts

**How to Win Against:**
- Emphasize TCO and ROI
- Highlight implementation speed
- Showcase flexibility

#### Competitor B - Feature Champion
**Positioning:** Technology-first approach

**Strengths:**
- Most features
- Strong R&D investment
- Technical credibility

**Weaknesses:**
- Overly complex
- Steep learning curve
- Support challenges

**How to Win Against:**
- Focus on usability
- Emphasize time-to-value
- Highlight support quality

### Battle Cards

**When They Say:** "Competitor A has more market share"
**We Say:** "Market share doesn't equal best fit. Let's focus on your specific needs and ROI."

**When They Say:** "Competitor B has more features"
**We Say:** "More features often means more complexity. Our solution delivers the 20% of features that drive 80% of value."

### Win Rate Analysis

| Competitor | Win Rate | Key Factor |
|------------|----------|------------|
| vs. A | 55% | TCO advantage |
| vs. B | 62% | Simplicity |
| vs. C | 71% | Support quality |

${context ? `\n**Analysis Context:** ${context}` : ''}`,

      rfp: `## RFP Response: ${topic}

### Cover Letter

**RE: Response to RFP - ${topic}**

Dear Selection Committee,

Thank you for the opportunity to respond to your RFP. We have carefully reviewed your requirements and are confident our solution meets and exceeds your expectations.

### Compliance Matrix

| Requirement ID | Requirement | Compliance | Reference |
|---------------|-------------|------------|-----------|
| REQ-001 | Core functionality | Full ✅ | Section 3.1 |
| REQ-002 | Integration capabilities | Full ✅ | Section 3.2 |
| REQ-003 | Security standards | Full ✅ | Section 4.1 |
| REQ-004 | Scalability | Full ✅ | Section 4.2 |
| REQ-005 | Support SLAs | Full ✅ | Section 5.1 |

### Technical Response

#### 3.1 Core Functionality

Our platform provides comprehensive capabilities including:

- **Feature A:** Complete alignment with REQ-001
- **Feature B:** Enhanced capabilities beyond requirements
- **Feature C:** Future-proof architecture

#### 3.2 Integration

Native integrations supported:
- ERP systems (SAP, Oracle)
- CRM platforms (Salesforce, Dynamics)
- Identity providers (Okta, Azure AD)
- Custom APIs (REST, GraphQL)

### Pricing

| Line Item | Unit Cost | Quantity | Total |
|-----------|-----------|----------|-------|
| Platform License | $100,000 | 1 | $100,000 |
| Implementation | $1,500/day | 30 | $45,000 |
| Training | $5,000 | 3 | $15,000 |
| Year 1 Support | $20,000 | 1 | $20,000 |
| **Total** | | | **$180,000** |

### References

We are pleased to provide the following references:

1. **[Company A]** - Similar industry, 3-year customer
2. **[Company B]** - Similar size, 2-year customer
3. **[Company C]** - Similar use case, 4-year customer

### Submission Confirmation

We confirm this response is valid for 90 days from submission date.

${context ? `\n**RFP Notes:** ${context}` : ''}`,

      'pitch-deck': `## Pitch Deck Content: ${topic}

### Slide 1: Title
**${topic}**
*Transforming [Industry] with Intelligent Solutions*

[Company Logo]
[Date]

---

### Slide 2: The Problem
**The Challenge Organizations Face**

📊 [Stat]: 70% of organizations struggle with...

- Pain Point 1: Inefficient processes
- Pain Point 2: Lack of visibility
- Pain Point 3: High operational costs

*"This is costing enterprises $X billion annually"*

---

### Slide 3: The Solution
**Introducing ${topic}**

Our platform delivers:
- ✅ 40% efficiency improvement
- ✅ Real-time visibility
- ✅ 25% cost reduction

[Product Screenshot/Demo]

---

### Slide 4: How It Works
**Simple, Powerful, Integrated**

1️⃣ **Connect** - Integrate with existing systems
2️⃣ **Analyze** - AI-powered insights
3️⃣ **Optimize** - Automated recommendations
4️⃣ **Measure** - Real-time dashboards

---

### Slide 5: Differentiation
**Why We're Different**

| Us | Competitors |
|----|-------------|
| Simple setup | Complex deployment |
| Rapid ROI | Long time-to-value |
| Dedicated support | Ticket queues |
| Flexible pricing | Rigid contracts |

---

### Slide 6: Proof Points
**Trusted by Industry Leaders**

🏆 500+ customers worldwide
⭐ 98% customer satisfaction
📈 $500M+ customer savings delivered

**Customer Quote:**
*"This solution transformed our operations..."*
— [Customer], [Title], [Company]

---

### Slide 7: ROI Calculator
**Your Potential Savings**

Based on your profile:
- Current cost: $X
- With our solution: $Y
- Annual savings: **$Z**
- Payback period: **14 months**

---

### Slide 8: Next Steps
**Let's Get Started**

1. Technical deep-dive (this week)
2. Pilot program (2 weeks)
3. Business case review
4. Decision

**Contact:**
[Name] | [Email] | [Phone]

${context ? `\n**Deck Notes:** ${context}` : ''}`,

      'win-loss': `## Win-Loss Analysis: ${topic}

### Executive Summary

Analysis of recent deal outcomes to identify patterns and improvement opportunities.

### Deal Summary

| Metric | Value |
|--------|-------|
| Deals Analyzed | 50 |
| Win Rate | 45% |
| Average Deal Size | $150K |
| Average Sales Cycle | 90 days |

### Win Analysis

**Top Win Factors:**
| Factor | Frequency | Impact |
|--------|-----------|--------|
| Solution fit | 85% | High |
| Relationship | 70% | High |
| Price/value | 65% | Medium |
| Reference quality | 55% | Medium |

**What Winners Say:**
- "Superior understanding of our needs"
- "Better long-term value proposition"
- "Trusted advisor approach"

### Loss Analysis

**Top Loss Factors:**
| Factor | Frequency | Impact |
|--------|-----------|--------|
| Price | 45% | High |
| Feature gaps | 35% | Medium |
| Competitor relationship | 30% | Medium |
| Timing | 25% | Low |

**What We Lost To:**
- Competitor A: 40% of losses (price)
- Competitor B: 30% of losses (features)
- No decision: 20% of losses
- Other: 10% of losses

### Recommendations

**Immediate Actions:**
1. Develop stronger ROI tools to combat price objections
2. Create feature comparison guides
3. Improve early-stage discovery

**Strategic Initiatives:**
1. Consider pricing structure review
2. Prioritize key feature gaps in roadmap
3. Invest in executive relationship building

### Trend Analysis

**Win Rate by Quarter:**
- Q1: 42%
- Q2: 44%
- Q3: 47%
- Q4: 45%

**Key Insight:** Win rate improving but price pressure increasing

${context ? `\n**Analysis Notes:** ${context}` : ''}`,
    };

    return responses[mode] || responses['proposal'];
  }
}
