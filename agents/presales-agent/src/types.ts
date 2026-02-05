/**
 * Type definitions for Presales/Sales Agent
 */

export type PresalesMode = 'proposal' | 'competitor' | 'rfp' | 'pitch-deck' | 'win-loss';

export interface PresalesRequest {
  topic: string;
  mode: PresalesMode;
  additionalContext?: string;
}

export interface ProposalOutput {
  executiveSummary: string;
  scopeOfWork: string;
  approach: string;
  timeline: string;
  teamStructure: string;
  pricing: string;
  differentiators: string;
}

export interface CompetitorAnalysis {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
  differentiators: string;
  recommendation: string;
}

export interface RFPResponse {
  requirement: string;
  response: string;
  evidence: string;
  compliance: string;
}

export interface PitchDeckOutline {
  slides: Array<{
    title: string;
    keyPoints: string[];
    talkingPoints: string[];
    visualSuggestion: string;
  }>;
}

export interface WinLossAnalysis {
  dealOutcome: string;
  keyFactors: string[];
  lessonsLearned: string[];
  recommendations: string[];
}

export interface PresalesOutput {
  topic: string;
  mode: PresalesMode;
  opportunityAnalysis: string;
  research: string;
  content: string;
  executiveSummary: string;
  competitivePositioning: string;
  generatedAt: string;
}
