/**
 * Type definitions for IT Operations Agent
 */

export type ITOpsMode = 'incident' | 'kb-search' | 'root-cause' | 'status-report' | 'runbook';

export interface ITOpsRequest {
  topic: string;
  mode: ITOpsMode;
  additionalContext?: string;
}

export interface IncidentTriage {
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  category: string;
  subcategory: string;
  assignedTeam: string;
  suggestedRemediation: string[];
  escalationPath: string;
}

export interface KBSearchResult {
  query: string;
  articles: Array<{
    title: string;
    relevance: string;
    summary: string;
    source: string;
  }>;
  recommendation: string;
}

export interface RootCauseAnalysis {
  incident: string;
  timeline: string[];
  rootCause: string;
  contributingFactors: string[];
  preventionRecommendations: string[];
}

export interface StatusReport {
  period: string;
  summary: string;
  incidents: { total: number; resolved: number; open: number };
  highlights: string[];
  risks: string[];
  actions: string[];
}

export interface RunbookTemplate {
  title: string;
  severity: string;
  service: string;
  symptoms: string[];
  diagnosticSteps: string[];
  resolutionSteps: string[];
  escalation: string;
  rollback: string;
}

export interface ITOpsOutput {
  topic: string;
  mode: ITOpsMode;
  classification: string;
  knowledgeRetrieval: string;
  analysis: string;
  report: string;
  generatedAt: string;
}
