import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

const SYSTEM_BASE = `You are a Senior Learning & Development (L&D) Strategist and Instructional Designer at Atos.
You specialise in capability building, skills frameworks, learning experience design, and talent development.
You understand adult learning principles, modern learning platforms, and enterprise skills strategy.
Format with clear Markdown including tables, frameworks, and actionable plans.`;

const MODE_PROMPTS: Record<string, string> = {
  'skill-gap': `${SYSTEM_BASE}

Conduct a skills gap analysis. Include:
- Current skills inventory framework
- Future-state skills requirements (by role/level)
- Gap identification matrix
- Critical skills priorities
- Build vs Buy vs Borrow strategy
- Skills taxonomy for the domain
- Measurement approach`,

  'learning-path': `${SYSTEM_BASE}

Design a structured learning path. Include:
- Learning objective and target audience
- Prerequisites
- Learning journey map (phases with duration)
- Curated resources per phase (courses, books, labs, projects)
- Milestone assessments
- Expected outcomes per stage
- Estimated time commitment
- Recommended platforms/tools`,

  training: `${SYSTEM_BASE}

Create a training programme design. Include:
- Programme overview and objectives
- Target audience and prerequisites
- Curriculum outline (modules and topics)
- Delivery method (instructor-led, e-learning, blended)
- Assessment strategy
- Materials list
- Facilitator guide outline
- Success metrics and evaluation approach`,

  assessment: `${SYSTEM_BASE}

Design a skills assessment framework. Include:
- Competency model (skills, behaviours, levels)
- Assessment method mix (tests, simulations, projects, 360)
- Question bank structure by competency
- Scoring and levelling rubric
- Calibration guidance
- Feedback template
- Development planning triggers`,

  'team-matrix': `${SYSTEM_BASE}

Create a team capability matrix. Include:
- Skill categories and sub-skills for the team
- Proficiency level definitions (1-5 scale)
- Visual matrix template (team members vs skills)
- Coverage analysis (redundancy, single points of failure)
- Succession planning gaps
- Priority development areas
- Team development roadmap`,
};

export class LearningDevAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'learning-dev',
    name: 'Learning & Development Agent',
    description: 'Skills gap analysis, learning paths, training design, assessment frameworks, and team capability matrices',
    category: 'HR',
    modes: [
      { id: 'skill-gap', label: 'Skills Gap', description: 'Skills gap analysis' },
      { id: 'learning-path', label: 'Learning Path', description: 'Curated learning journey' },
      { id: 'training', label: 'Training Design', description: 'Programme design' },
      { id: 'assessment', label: 'Assessment', description: 'Skills assessment framework' },
      { id: 'team-matrix', label: 'Team Matrix', description: 'Capability matrix' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Skills Analysis', 'running');
    this.emitThinking(onEvent, `Analysing learning & development request: ${topic}...\n`);
    this.emitStage(onEvent, 0, 'Skills Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Content Design', 'running');
    this.emitThinking(onEvent, `Creating ${mode} content...\n`);

    const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS['learning-path'];
    const userMessage = `${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await this.callClaudeStream(systemPrompt, userMessage, onEvent);

    this.emitStage(onEvent, 1, 'Content Design', 'completed');
    this.emitDone(onEvent);
    return response;
  }
}
