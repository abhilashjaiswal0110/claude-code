import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class RecruitmentAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'recruitment-agent',
    name: 'Recruitment',
    description: 'Job descriptions, candidate screening, interview questions, comparisons, and offer letters',
    category: 'HR',
    modes: [
      { id: 'jd', label: 'Job Description', description: 'Generate job descriptions' },
      { id: 'screening', label: 'Screening', description: 'Screen candidate profiles' },
      { id: 'interview', label: 'Interview', description: 'Create interview questions' },
      { id: 'comparison', label: 'Comparison', description: 'Compare candidates' },
      { id: 'offer', label: 'Offer Letter', description: 'Draft offer letters' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Requirements Analysis', 'running');
    this.emitThinking(onEvent, `Analyzing recruitment requirements for ${mode}...\n`);
    await this.delay(500);
    this.emitStage(onEvent, 0, 'Requirements Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Content Generation', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 1, 'Content Generation', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      jd: `## Job Description: ${topic}

### About the Role

We are seeking an exceptional **${topic}** to join our growing team. This is an exciting opportunity to make a significant impact in a dynamic environment.

### Responsibilities

- Lead and execute key initiatives aligned with business objectives
- Collaborate with cross-functional teams to deliver results
- Drive innovation and continuous improvement in processes
- Mentor and develop team members
- Report on progress and provide strategic recommendations

### Requirements

**Must Have:**
- 5+ years of relevant experience
- Strong track record of delivering results
- Excellent communication and leadership skills
- Bachelor's degree in related field

**Nice to Have:**
- Master's degree or MBA
- Experience in enterprise environments
- Industry certifications
- Global or multi-cultural experience

### Technical Skills

- Proficiency in relevant tools and technologies
- Data-driven decision making
- Process optimization experience
- Project management capabilities

### What We Offer

- Competitive salary and benefits package
- Flexible working arrangements
- Professional development opportunities
- Collaborative and inclusive culture
- Career growth potential

### Location & Work Style

- [Location]: Hybrid (3 days in office)
- Travel: Up to 10%

${context ? `\n**Additional Requirements:** ${context}` : ''}

---
*We are an equal opportunity employer.*`,

      screening: `## Candidate Screening Report: ${topic}

### Candidate Overview

| Criteria | Assessment |
|----------|------------|
| Overall Match | 78% |
| Experience | Strong |
| Skills | Good |
| Culture Fit | Promising |

### Experience Analysis

**Relevant Experience:**
- ✅ 6 years in similar roles
- ✅ Industry experience matches
- ✅ Progressive career growth
- ⚠️ Limited enterprise experience

**Key Achievements:**
1. Led team of 8 members
2. Delivered 15% efficiency improvement
3. Managed $2M budget

### Skills Assessment

| Skill | Required | Candidate | Gap |
|-------|----------|-----------|-----|
| Leadership | Expert | Strong | Minor |
| Technical | Advanced | Advanced | None |
| Communication | Expert | Strong | Minor |
| Strategy | Advanced | Intermediate | Moderate |

### Red Flags / Concerns

- Short tenure at previous role (1.5 years)
- Gap in employment (6 months - explained as personal development)

### Recommendation

**Proceed to Interview:** Yes ✅

**Suggested Focus Areas for Interview:**
1. Dig deeper into short tenure at previous company
2. Assess strategic thinking capabilities
3. Explore leadership style and examples

${context ? `\n**Screening Notes:** ${context}` : ''}`,

      interview: `## Interview Questions: ${topic}

### Opening Questions (5 min)

1. **Tell me about yourself and what attracted you to this role.**
   - *Assess: Communication, self-awareness, motivation*

2. **What do you know about our company?**
   - *Assess: Preparation, genuine interest*

### Experience & Competency (20 min)

3. **Describe a challenging project you led. What was your approach?**
   - *Assess: Leadership, problem-solving*
   - *Follow-up: What would you do differently?*

4. **Tell me about a time you had to influence without authority.**
   - *Assess: Influence, stakeholder management*
   - *Look for: STAR format, specific examples*

5. **How do you prioritize when everything seems urgent?**
   - *Assess: Time management, decision-making*

### Technical/Role-Specific (15 min)

6. **Walk me through how you would approach [specific scenario].**
   - *Assess: Technical knowledge, methodology*

7. **What tools and frameworks do you use in your work?**
   - *Assess: Technical proficiency, adaptability*

### Culture & Values (10 min)

8. **Describe your ideal work environment.**
   - *Assess: Culture fit, self-awareness*

9. **How do you handle disagreements with colleagues?**
   - *Assess: Conflict resolution, EQ*

10. **What does professional growth mean to you?**
    - *Assess: Growth mindset, ambition*

### Closing (5 min)

11. **What questions do you have for me?**
    - *Assess: Curiosity, engagement*

### Scoring Guide

| Rating | Description |
|--------|-------------|
| 5 | Exceptional - exceeds requirements |
| 4 | Strong - meets and exceeds some |
| 3 | Good - meets requirements |
| 2 | Developing - partially meets |
| 1 | Does not meet requirements |

${context ? `\n**Interview Focus:** ${context}` : ''}`,

      comparison: `## Candidate Comparison: ${topic}

### Executive Summary

Comparing top candidates for the ${topic} position based on comprehensive evaluation criteria.

### Candidate Matrix

| Criteria | Candidate A | Candidate B | Candidate C |
|----------|-------------|-------------|-------------|
| **Overall Score** | 85/100 | 82/100 | 78/100 |
| Experience Years | 7 | 5 | 8 |
| Technical Skills | 4.5/5 | 4/5 | 4/5 |
| Leadership | 4/5 | 4.5/5 | 3.5/5 |
| Culture Fit | 4/5 | 4/5 | 4.5/5 |
| Salary Expectation | $150K | $140K | $160K |

### Detailed Analysis

#### Candidate A - Recommended ⭐
**Strengths:**
- Most balanced profile across all criteria
- Strong technical foundation
- Proven track record of delivery

**Considerations:**
- Salary expectation at upper range
- May need support in certain areas

#### Candidate B
**Strengths:**
- Excellent leadership potential
- Cost-effective
- High growth trajectory

**Considerations:**
- Less experience than others
- May need longer ramp-up

#### Candidate C
**Strengths:**
- Most experienced
- Strong culture fit
- Industry knowledge

**Considerations:**
- Highest salary expectation
- Leadership scores lower

### Recommendation

**First Choice:** Candidate A
- Best overall balance of skills, experience, and fit
- Represents good value for compensation level

**Backup:** Candidate B
- If Candidate A declines, strong alternative with growth potential

${context ? `\n**Comparison Context:** ${context}` : ''}`,

      offer: `## Offer Letter Draft: ${topic}

---

**[COMPANY LOGO]**

**[Date]**

**[Candidate Name]**
**[Address]**

Dear [Candidate Name],

We are pleased to offer you the position of **${topic}** at [Company Name]. We were impressed with your qualifications and believe you will be a valuable addition to our team.

### Position Details

| Item | Details |
|------|---------|
| Position | ${topic} |
| Department | [Department] |
| Reports To | [Manager Name] |
| Start Date | [Date] |
| Location | [Location] |
| Work Type | Hybrid |

### Compensation Package

**Base Salary:** $[Amount] annually, paid bi-weekly

**Bonus:** Eligible for annual performance bonus up to [X]% of base salary

**Equity:** [Stock options/RSUs details if applicable]

### Benefits

- Health, dental, and vision insurance (effective Day 1)
- 401(k) with company match
- [X] days paid time off annually
- Professional development allowance
- Flexible working arrangements

### Terms

This offer is contingent upon:
- Successful completion of background check
- Verification of employment eligibility
- Signing of confidentiality agreement

### Next Steps

Please confirm your acceptance by signing and returning this letter by **[Date]**. If you have any questions, please contact [HR Contact] at [Email].

We are excited about the prospect of you joining our team and contributing to our continued success.

Sincerely,

**[Hiring Manager Name]**
**[Title]**

---

**Acceptance:**

I accept the offer of employment as described above.

Signature: _________________ Date: _________________

${context ? `\n**HR Notes:** ${context}` : ''}`,
    };

    return responses[mode] || responses['jd'];
  }
}
