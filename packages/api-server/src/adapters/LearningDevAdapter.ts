import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class LearningDevAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'learning-dev-agent',
    name: 'Learning & Dev',
    description: 'Skill gap analysis, learning paths, training plans, assessments, and team skill matrices',
    category: 'L&D',
    modes: [
      { id: 'skill-gap', label: 'Skill Gap', description: 'Analyze skill gaps' },
      { id: 'learning-path', label: 'Learning Path', description: 'Create learning paths' },
      { id: 'training', label: 'Training Plan', description: 'Develop training plans' },
      { id: 'assessment', label: 'Assessment', description: 'Create skill assessments' },
      { id: 'team-matrix', label: 'Team Matrix', description: 'Build team skill matrices' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Requirements Analysis', 'running');
    this.emitThinking(onEvent, `Analyzing learning requirements for ${mode}...\n`);
    await this.delay(500);
    this.emitStage(onEvent, 0, 'Requirements Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Content Development', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 1, 'Content Development', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      'skill-gap': `## Skill Gap Analysis: ${topic}

### Executive Summary

This analysis identifies skill gaps for ${topic.toLowerCase()} to inform targeted development initiatives.

### Current vs. Required Skills

| Skill Area | Current Level | Required Level | Gap |
|------------|---------------|----------------|-----|
| Technical Skills | 3.2/5 | 4.5/5 | 1.3 |
| Leadership | 3.5/5 | 4.0/5 | 0.5 |
| Communication | 3.8/5 | 4.2/5 | 0.4 |
| Strategic Thinking | 2.8/5 | 4.0/5 | 1.2 |
| Data Analysis | 2.5/5 | 4.0/5 | 1.5 |

### Critical Gaps Identified

**High Priority (Gap > 1.0):**
1. **Data Analysis** - Gap: 1.5
   - Impact: Unable to make data-driven decisions
   - Root Cause: Limited formal training, tool access

2. **Technical Skills** - Gap: 1.3
   - Impact: Reduced efficiency and innovation
   - Root Cause: Rapidly evolving technology landscape

3. **Strategic Thinking** - Gap: 1.2
   - Impact: Tactical focus limiting growth
   - Root Cause: Limited exposure to strategic projects

### Gap Distribution

| Gap Level | Count | % of Total |
|-----------|-------|------------|
| Critical (>1.5) | 1 | 20% |
| High (1.0-1.5) | 2 | 40% |
| Medium (0.5-1.0) | 1 | 20% |
| Low (<0.5) | 1 | 20% |

### Recommendations

| Priority | Action | Timeline | Investment |
|----------|--------|----------|------------|
| 1 | Data analytics training | Q1 | $15,000 |
| 2 | Technical certifications | Q1-Q2 | $20,000 |
| 3 | Leadership coaching | Q2 | $10,000 |
| 4 | Strategic workshops | Q3 | $8,000 |

### ROI Projection

- Investment: $53,000
- Expected productivity gain: 15%
- Estimated annual benefit: $120,000
- ROI: 126%

${context ? `\n**Analysis Context:** ${context}` : ''}`,

      'learning-path': `## Learning Path: ${topic}

### Path Overview

| Attribute | Value |
|-----------|-------|
| Target Role | ${topic} |
| Duration | 6 months |
| Commitment | 5-8 hours/week |
| Level | Intermediate to Advanced |

### Learning Journey

#### Phase 1: Foundation (Weeks 1-4)
**Objective:** Build core knowledge base

📚 **Modules:**
1. Fundamentals of ${topic}
   - Duration: 10 hours
   - Format: Self-paced online
   - Assessment: Quiz (80% to pass)

2. Industry Best Practices
   - Duration: 8 hours
   - Format: Video + readings
   - Assessment: Case study

3. Tools & Technologies
   - Duration: 12 hours
   - Format: Hands-on labs
   - Assessment: Practical exercise

**Milestone:** Complete foundation certification

---

#### Phase 2: Applied Skills (Weeks 5-12)
**Objective:** Develop practical capabilities

📚 **Modules:**
4. Advanced Techniques
   - Duration: 15 hours
   - Format: Workshop + practice
   - Assessment: Project

5. Real-World Applications
   - Duration: 20 hours
   - Format: Case studies
   - Assessment: Presentation

6. Collaboration & Leadership
   - Duration: 10 hours
   - Format: Group exercises
   - Assessment: Peer review

**Milestone:** Complete applied skills project

---

#### Phase 3: Mastery (Weeks 13-24)
**Objective:** Achieve expertise level

📚 **Modules:**
7. Strategic Application
   - Duration: 15 hours
   - Format: Mentored project
   - Assessment: Executive presentation

8. Innovation & Trends
   - Duration: 10 hours
   - Format: Research + discussion
   - Assessment: Thought paper

9. Capstone Project
   - Duration: 30 hours
   - Format: Real business problem
   - Assessment: Panel review

**Milestone:** Capstone completion + certification

### Resources

- Online platform access
- Mentor assignment
- Peer learning cohort
- Reference library
- Practice environments

${context ? `\n**Path Customization:** ${context}` : ''}`,

      training: `## Training Plan: ${topic}

### Training Overview

| Item | Details |
|------|---------|
| Program | ${topic} |
| Audience | [Target group] |
| Duration | 3 days |
| Format | Blended (virtual + in-person) |
| Participants | 15-20 |

### Learning Objectives

By the end of this training, participants will be able to:

1. ✅ Understand core concepts and terminology
2. ✅ Apply best practices in real scenarios
3. ✅ Use relevant tools and technologies
4. ✅ Solve common challenges independently
5. ✅ Collaborate effectively with team members

### Day-by-Day Agenda

#### Day 1: Foundations
| Time | Topic | Format | Duration |
|------|-------|--------|----------|
| 9:00 | Welcome & Introductions | Facilitated | 30 min |
| 9:30 | Core Concepts Overview | Presentation | 90 min |
| 11:00 | Break | - | 15 min |
| 11:15 | Hands-on Exercise 1 | Workshop | 60 min |
| 12:15 | Lunch | - | 60 min |
| 13:15 | Best Practices Deep Dive | Discussion | 90 min |
| 14:45 | Break | - | 15 min |
| 15:00 | Case Study Analysis | Group work | 90 min |
| 16:30 | Day 1 Wrap-up | Q&A | 30 min |

#### Day 2: Application
| Time | Topic | Format | Duration |
|------|-------|--------|----------|
| 9:00 | Day 1 Review | Discussion | 30 min |
| 9:30 | Tools & Technologies | Demo | 90 min |
| 11:00 | Break | - | 15 min |
| 11:15 | Hands-on Exercise 2 | Lab | 90 min |
| 12:45 | Lunch | - | 60 min |
| 13:45 | Real-World Scenarios | Simulation | 120 min |
| 15:45 | Break | - | 15 min |
| 16:00 | Group Project Introduction | Briefing | 60 min |

#### Day 3: Integration
| Time | Topic | Format | Duration |
|------|-------|--------|----------|
| 9:00 | Group Project Work | Collaboration | 150 min |
| 11:30 | Presentations | Group | 90 min |
| 13:00 | Lunch | - | 60 min |
| 14:00 | Expert Panel Q&A | Discussion | 60 min |
| 15:00 | Action Planning | Individual | 60 min |
| 16:00 | Certification & Closing | Ceremony | 60 min |

### Materials Required

- [ ] Participant workbooks
- [ ] Presentation slides
- [ ] Exercise files
- [ ] Assessment forms
- [ ] Certificates

### Success Metrics

| Metric | Target |
|--------|--------|
| Satisfaction score | >4.5/5 |
| Knowledge test pass rate | >85% |
| Application in 30 days | >70% |

${context ? `\n**Training Notes:** ${context}` : ''}`,

      assessment: `## Skill Assessment: ${topic}

### Assessment Overview

| Item | Details |
|------|---------|
| Assessment | ${topic} Competency Evaluation |
| Duration | 60 minutes |
| Format | Mixed (MCQ + Practical + Scenario) |
| Passing Score | 70% |

### Section 1: Knowledge Check (30 points)

**Multiple Choice Questions (10 questions x 3 points)**

1. Which of the following best describes...?
   - a) Option A
   - b) Option B ✓
   - c) Option C
   - d) Option D

2. What is the primary purpose of...?
   - a) Option A
   - b) Option B
   - c) Option C ✓
   - d) Option D

3. When implementing..., which approach is recommended?
   - a) Option A ✓
   - b) Option B
   - c) Option C
   - d) Option D

*[Questions 4-10 follow similar format]*

---

### Section 2: Practical Exercise (40 points)

**Task:** Complete the following practical exercise demonstrating your skills in ${topic.toLowerCase()}.

**Scenario:**
You have been asked to [specific task description]. Using the provided resources, complete the following:

1. **Analysis** (10 points)
   - Review the given information
   - Identify key requirements
   - Document assumptions

2. **Solution Design** (15 points)
   - Create a structured approach
   - Justify your methodology
   - Consider alternatives

3. **Implementation** (15 points)
   - Execute your solution
   - Document your process
   - Verify results

**Evaluation Criteria:**
| Criterion | Weight |
|-----------|--------|
| Accuracy | 40% |
| Completeness | 30% |
| Methodology | 20% |
| Presentation | 10% |

---

### Section 3: Scenario Response (30 points)

**Scenario:** Read the following case study and respond to the questions.

*[Case study description - 200-300 words describing a realistic workplace scenario]*

**Questions:**

1. **(10 points)** What are the key challenges in this scenario?

2. **(10 points)** What approach would you recommend and why?

3. **(10 points)** What risks do you foresee and how would you mitigate them?

---

### Scoring Guide

| Score | Level | Recommendation |
|-------|-------|----------------|
| 90-100% | Expert | Ready for advanced roles |
| 80-89% | Proficient | Minor development areas |
| 70-79% | Competent | Targeted training recommended |
| Below 70% | Developing | Comprehensive training required |

${context ? `\n**Assessment Notes:** ${context}` : ''}`,

      'team-matrix': `## Team Skill Matrix: ${topic}

### Team Overview

| Item | Value |
|------|-------|
| Team | ${topic} |
| Members | 8 |
| Assessment Date | ${new Date().toLocaleDateString()} |
| Next Review | Quarterly |

### Skill Matrix

| Team Member | Technical | Leadership | Communication | Problem Solving | Domain Knowledge | Overall |
|-------------|-----------|------------|---------------|-----------------|------------------|---------|
| Alice | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4.4 |
| Bob | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 3.8 |
| Carol | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 4.0 |
| David | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4.0 |
| Eve | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 3.8 |
| Frank | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 3.8 |
| Grace | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4.4 |
| Henry | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 3.6 |

**Legend:** ⭐ = Basic | ⭐⭐ = Developing | ⭐⭐⭐ = Competent | ⭐⭐⭐⭐ = Proficient | ⭐⭐⭐⭐⭐ = Expert

### Team Averages

| Skill | Team Average | Target | Gap |
|-------|--------------|--------|-----|
| Technical | 4.0 | 4.5 | -0.5 |
| Leadership | 3.75 | 4.0 | -0.25 |
| Communication | 4.0 | 4.0 | 0 |
| Problem Solving | 4.13 | 4.0 | +0.13 |
| Domain Knowledge | 3.88 | 4.5 | -0.62 |

### Strengths & Gaps

**Team Strengths:**
- 🏆 Problem Solving (above target)
- 🏆 Communication (meets target)
- 🏆 Two expert-level members (Alice, Grace)

**Development Areas:**
- 📈 Domain Knowledge (largest gap)
- 📈 Technical Skills (moderate gap)
- 📈 Henry needs broad development

### Coverage Analysis

| Skill | Experts | Backup | Risk Level |
|-------|---------|--------|------------|
| Technical | 3 | 2 | Low |
| Leadership | 2 | 2 | Medium |
| Communication | 2 | 3 | Low |
| Problem Solving | 3 | 2 | Low |
| Domain Knowledge | 2 | 1 | High |

### Recommendations

1. **Critical:** Cross-train domain knowledge (high risk area)
2. **High:** Develop Henry's technical skills
3. **Medium:** Leadership development for high-performers
4. **Ongoing:** Maintain problem-solving excellence

${context ? `\n**Matrix Notes:** ${context}` : ''}`,
    };

    return responses[mode] || responses['skill-gap'];
  }
}
