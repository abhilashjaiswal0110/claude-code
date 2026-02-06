export interface AgentMode {
  id: string;
  label: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  modes: AgentMode[];
  quickActions: string[];
}

export const agents: Agent[] = [
  {
    id: 'hr-agent',
    name: 'HR Agent',
    description: 'HR policy guidance, benefits explanations, engagement analysis, onboarding guides, and exit interview summaries',
    category: 'HR',
    icon: '👥',
    color: 'agent-hr',
    modes: [
      { id: 'policy', label: 'Policy Query', description: 'Answer questions about company policies' },
      { id: 'benefits', label: 'Benefits', description: 'Explain employee benefits and enrollment' },
      { id: 'engagement', label: 'Engagement', description: 'Analyze employee engagement data' },
      { id: 'onboarding', label: 'Onboarding', description: 'Create onboarding guides and checklists' },
      { id: 'exit-interview', label: 'Exit Interview', description: 'Summarize exit interview insights' },
    ],
    quickActions: [
      'Ask about WFH policy',
      'Benefits overview',
      'Onboarding checklist',
    ],
  },
  {
    id: 'it-operations-agent',
    name: 'IT Operations',
    description: 'Incident response, knowledge base search, root cause analysis, status reports, and runbook generation',
    category: 'IT',
    icon: '🖥️',
    color: 'agent-it',
    modes: [
      { id: 'incident', label: 'Incident', description: 'Handle and document incidents' },
      { id: 'kb-search', label: 'KB Search', description: 'Search knowledge base articles' },
      { id: 'root-cause', label: 'Root Cause', description: 'Perform root cause analysis' },
      { id: 'status-report', label: 'Status Report', description: 'Generate system status reports' },
      { id: 'runbook', label: 'Runbook', description: 'Create operational runbooks' },
    ],
    quickActions: [
      'Report incident',
      'Check system status',
      'Create runbook',
    ],
  },
  {
    id: 'marketing-agent',
    name: 'Marketing',
    description: 'Blog posts, social media content, campaign briefs, press releases, and newsletter drafts',
    category: 'Marketing',
    icon: '📢',
    color: 'agent-marketing',
    modes: [
      { id: 'blog', label: 'Blog Post', description: 'Write blog posts and articles' },
      { id: 'social', label: 'Social Media', description: 'Create social media content' },
      { id: 'campaign', label: 'Campaign', description: 'Develop campaign briefs' },
      { id: 'press-release', label: 'Press Release', description: 'Draft press releases' },
      { id: 'newsletter', label: 'Newsletter', description: 'Write newsletter content' },
    ],
    quickActions: [
      'Write LinkedIn post',
      'Blog outline',
      'Campaign brief',
    ],
  },
  {
    id: 'recruitment-agent',
    name: 'Recruitment',
    description: 'Job descriptions, candidate screening, interview questions, comparisons, and offer letters',
    category: 'HR',
    icon: '🎯',
    color: 'agent-recruitment',
    modes: [
      { id: 'jd', label: 'Job Description', description: 'Generate job descriptions' },
      { id: 'screening', label: 'Screening', description: 'Screen candidate profiles' },
      { id: 'interview', label: 'Interview', description: 'Create interview questions' },
      { id: 'comparison', label: 'Comparison', description: 'Compare candidates' },
      { id: 'offer', label: 'Offer Letter', description: 'Draft offer letters' },
    ],
    quickActions: [
      'Generate job description',
      'Screen candidates',
      'Interview questions',
    ],
  },
  {
    id: 'presales-agent',
    name: 'Presales',
    description: 'Proposals, competitor analysis, RFP responses, pitch decks, and win-loss analysis',
    category: 'Sales',
    icon: '💼',
    color: 'agent-presales',
    modes: [
      { id: 'proposal', label: 'Proposal', description: 'Draft sales proposals' },
      { id: 'competitor', label: 'Competitor', description: 'Analyze competitors' },
      { id: 'rfp', label: 'RFP Response', description: 'Respond to RFPs' },
      { id: 'pitch-deck', label: 'Pitch Deck', description: 'Create pitch deck content' },
      { id: 'win-loss', label: 'Win-Loss', description: 'Analyze deal outcomes' },
    ],
    quickActions: [
      'Draft proposal',
      'Competitor analysis',
      'RFP response',
    ],
  },
  {
    id: 'learning-dev-agent',
    name: 'Learning & Dev',
    description: 'Skill gap analysis, learning paths, training plans, assessments, and team skill matrices',
    category: 'L&D',
    icon: '📚',
    color: 'agent-learning',
    modes: [
      { id: 'skill-gap', label: 'Skill Gap', description: 'Analyze skill gaps' },
      { id: 'learning-path', label: 'Learning Path', description: 'Create learning paths' },
      { id: 'training', label: 'Training Plan', description: 'Develop training plans' },
      { id: 'assessment', label: 'Assessment', description: 'Create skill assessments' },
      { id: 'team-matrix', label: 'Team Matrix', description: 'Build team skill matrices' },
    ],
    quickActions: [
      'Skill gap analysis',
      'Learning path',
      'Training plan',
    ],
  },
  {
    id: 'linkedin-content-generator',
    name: 'LinkedIn Generator',
    description: 'Research topics and generate dual LinkedIn post variations with engagement optimization',
    category: 'Content',
    icon: '💡',
    color: 'agent-linkedin',
    modes: [
      { id: 'research', label: 'Research', description: 'Research trending topics' },
      { id: 'generate', label: 'Generate Posts', description: 'Generate post variations' },
    ],
    quickActions: [
      'Generate post about...',
      'Research trending topics',
    ],
  },
  {
    id: 'sustainability-agent',
    name: 'Sustainability',
    description: 'Carbon footprint analysis, green IT recommendations, ESG reports, and energy optimization',
    category: 'ESG',
    icon: '🌱',
    color: 'agent-sustainability',
    modes: [
      { id: 'carbon-footprint', label: 'Carbon Footprint', description: 'Analyze carbon footprint' },
      { id: 'green-it', label: 'Green IT', description: 'Green IT recommendations' },
      { id: 'sustainability-report', label: 'Report', description: 'Generate sustainability reports' },
      { id: 'energy-opt', label: 'Energy Optimization', description: 'Optimize energy usage' },
      { id: 'esg', label: 'ESG Analysis', description: 'ESG compliance analysis' },
    ],
    quickActions: [
      'Carbon footprint report',
      'Green IT recommendations',
    ],
  },
  {
    id: 'cloud-ops-agent',
    name: 'Cloud Operations',
    description: 'Cost optimization, incident response, capacity planning, architecture review, and migration assessment',
    category: 'Ops',
    icon: '☁️',
    color: 'agent-cloud',
    modes: [
      { id: 'cost-opt', label: 'Cost Optimization', description: 'Optimize cloud costs' },
      { id: 'incident-response', label: 'Incident Response', description: 'Handle cloud incidents' },
      { id: 'capacity', label: 'Capacity Planning', description: 'Plan capacity needs' },
      { id: 'arch-review', label: 'Architecture Review', description: 'Review cloud architecture' },
      { id: 'migration', label: 'Migration', description: 'Assess migration readiness' },
    ],
    quickActions: [
      'Cost optimization',
      'Architecture review',
      'Migration assessment',
    ],
  },
];

export const agentsByCategory = agents.reduce((acc, agent) => {
  if (!acc[agent.category]) {
    acc[agent.category] = [];
  }
  acc[agent.category].push(agent);
  return acc;
}, {} as Record<string, Agent[]>);

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
