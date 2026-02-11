import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Senior Talent Acquisition Specialist and HR Business Partner at Atos.
You have deep expertise in recruitment, talent assessment, employer branding, and workforce planning.
You create fair, inclusive, legally compliant content. You understand competency-based interviewing and
structured hiring processes. Format with clear Markdown structure.`;

const MODE_PROMPTS: Record<string, string> = {
  jd: `${SYSTEM_BASE}

Create a compelling, inclusive job description. Include:
- Job title and level
- Team and reporting structure
- Role overview (2-3 sentences, impact-focused)
- Key responsibilities (6-8 bullet points)
- Required qualifications (must-haves only)
- Preferred qualifications
- What we offer (benefits, growth, culture)
- Diversity and inclusion statement
Avoid gendered language and unnecessary requirements that limit diverse candidates.`,

  screening: `${SYSTEM_BASE}

Create a structured candidate screening framework. Include:
- Screening criteria matrix (must-have vs nice-to-have)
- Phone/video screening question bank (10 questions)
- Red flags to watch for
- Scoring rubric (1-5 scale per competency)
- Candidate comparison template
- Recommended screening sequence`,

  interview: `${SYSTEM_BASE}

Design a comprehensive interview guide. Include:
- Interview structure (stages, interviewers, duration)
- Competency framework for the role
- Behavioural questions (STAR format) per competency (3 questions each)
- Technical assessment questions if relevant
- Candidate evaluation scorecard
- Legal/compliance reminders (questions to avoid)
- Debrief discussion guide`,

  comparison: `${SYSTEM_BASE}

Create a structured candidate comparison report. Include:
- Evaluation criteria and weighting
- Side-by-side competency comparison matrix
- Strengths and development areas per candidate
- Culture fit assessment
- Risk factors
- Recommendation with clear rationale
- Onboarding considerations for top candidate`,

  offer: `${SYSTEM_BASE}

Draft a professional offer letter and package summary. Include:
- Offer letter template (formal, warm tone)
- Compensation package breakdown (base, variable, equity placeholders)
- Benefits summary
- Start date and onboarding schedule
- Acceptance deadline and process
- Background check and reference requirements
- Negotiation guidance for recruiter`,
};

export class RecruitmentAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'recruitment-agent',
    name: 'Recruitment Agent',
    description: 'Job descriptions, screening frameworks, interview guides, candidate comparison, and offer letters',
    category: 'HR',
    modes: [
      { id: 'jd', label: 'Job Description', description: 'Create inclusive job postings' },
      { id: 'screening', label: 'Screening', description: 'Candidate screening framework' },
      { id: 'interview', label: 'Interview Guide', description: 'Structured interview questions' },
      { id: 'comparison', label: 'Comparison', description: 'Candidate evaluation matrix' },
      { id: 'offer', label: 'Offer Letter', description: 'Offer package and letter' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Role Analysis', 'running');
    this.emitThinking(onEvent, `Analysing recruitment request for: ${topic}...\n`);
    this.emitStage(onEvent, 0, 'Role Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Document Generation', 'running');
    this.emitThinking(onEvent, `Creating ${mode} document...\n`);

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['jd'];
    const userMessage = `Role/Request: "${topic}"${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent, 4096, signal);

    this.emitStage(onEvent, 1, 'Document Generation', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
