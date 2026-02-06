import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class HRAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'hr-agent',
    name: 'HR Agent',
    description: 'HR policy guidance, benefits explanations, engagement analysis, onboarding guides, and exit interview summaries',
    category: 'HR',
    modes: [
      { id: 'policy', label: 'Policy Query', description: 'Answer questions about company policies' },
      { id: 'benefits', label: 'Benefits', description: 'Explain employee benefits and enrollment' },
      { id: 'engagement', label: 'Engagement', description: 'Analyze employee engagement data' },
      { id: 'onboarding', label: 'Onboarding', description: 'Create onboarding guides and checklists' },
      { id: 'exit-interview', label: 'Exit Interview', description: 'Summarize exit interview insights' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    // Stage 1: Classification
    this.emitStage(onEvent, 0, 'Classification', 'running');
    this.emitThinking(onEvent, `Classifying query type for mode: ${mode}...\n`);
    await this.delay(500);
    this.emitStage(onEvent, 0, 'Classification', 'completed');

    // Stage 2: Processing
    this.emitStage(onEvent, 1, 'Policy Search', 'running');
    this.emitThinking(onEvent, 'Searching policy documents and knowledge base...\n');
    await this.delay(800);
    this.emitStage(onEvent, 1, 'Policy Search', 'completed');

    // Stage 3: Response Generation
    this.emitStage(onEvent, 2, 'Response Generation', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 2, 'Response Generation', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      policy: `## HR Policy Response

**Query:** ${topic}

### Policy Information

Based on the company policy documents, here is the relevant information:

1. **General Policy**: The company maintains comprehensive policies on various employment matters including work arrangements, leave, benefits, and conduct.

2. **Specific Guidance**: For your specific query about "${topic}", I recommend:
   - Review the Employee Handbook Section 3.2
   - Consult with your direct manager for role-specific applications
   - Contact HR directly for confidential matters

3. **Next Steps**:
   - Submit a formal request through the HR portal if applicable
   - Document any approvals in writing
   - Keep copies of all correspondence

${context ? `\n**Additional Context Considered:** ${context}` : ''}

---
*Disclaimer: This guidance is for informational purposes only. Please consult HR for official policy interpretations.*`,

      benefits: `## Benefits Overview

**Topic:** ${topic}

### Benefit Details

**Eligibility:**
- Full-time employees are eligible after the probation period
- Part-time employees may have prorated benefits

**Enrollment:**
- Open enrollment period: November 1-30 annually
- Life events allow for special enrollment within 30 days

**Coverage Options:**
1. Basic Plan - Essential coverage
2. Standard Plan - Comprehensive coverage
3. Premium Plan - Enhanced coverage with additional perks

**How to Enroll:**
1. Log into the HR Self-Service Portal
2. Navigate to Benefits > Enrollment
3. Review and select your options
4. Confirm your selections before the deadline

${context ? `\n**Additional Context:** ${context}` : ''}

---
*Contact benefits@company.com for specific questions.*`,

      engagement: `## Engagement Analysis

**Topic:** ${topic}

### Key Findings

**Overall Sentiment:** Moderate Positive

**Themes Identified:**
1. **Work-Life Balance** - Mixed feedback, improvement opportunities
2. **Career Development** - Strong interest in growth paths
3. **Team Collaboration** - Generally positive responses
4. **Communication** - Area for improvement identified

### Recommendations

| Priority | Action Item | Timeline |
|----------|-------------|----------|
| High | Implement flexible work arrangements | Q1 |
| Medium | Launch mentorship program | Q2 |
| Medium | Enhance internal communications | Q2 |
| Low | Review recognition programs | Q3 |

${context ? `\n**Analysis Context:** ${context}` : ''}`,

      onboarding: `## Onboarding Guide

**For:** ${topic}

### Pre-Joining Checklist
- [ ] Complete background verification
- [ ] Submit required documents
- [ ] Set up company email access

### Week 1 Schedule
| Day | Activities |
|-----|------------|
| Mon | Orientation, IT setup, Badge collection |
| Tue | HR briefing, Benefits enrollment |
| Wed | Team introductions, Workspace tour |
| Thu | Role-specific training begins |
| Fri | 1:1 with manager, Week 1 recap |

### Week 2 Focus
- Shadow team members
- Begin assigned projects
- Complete mandatory training modules

### 30/60/90 Day Milestones
- **30 Days:** Complete all onboarding training, establish key relationships
- **60 Days:** Contribute to first project deliverable
- **90 Days:** Full integration, initial performance discussion

${context ? `\n**Special Considerations:** ${context}` : ''}`,

      'exit-interview': `## Exit Interview Analysis

**Topic:** ${topic}

### Departure Patterns

**Top Reasons Identified:**
1. Career Growth Opportunities (35%)
2. Compensation & Benefits (25%)
3. Work-Life Balance (20%)
4. Management Relationship (12%)
5. Other (8%)

### Systemic Issues
- Limited promotion pathways in certain departments
- Compensation below market rate for specific roles
- Remote work policy concerns

### Retention Recommendations

| Priority | Recommendation | Expected Impact |
|----------|----------------|-----------------|
| High | Review compensation bands | Reduce attrition 15% |
| High | Create clear career paths | Improve retention 20% |
| Medium | Enhance remote work policy | Improve satisfaction |
| Medium | Manager training program | Better team retention |

${context ? `\n**Additional Context:** ${context}` : ''}`,
    };

    return responses[mode] || responses['policy'];
  }
}
