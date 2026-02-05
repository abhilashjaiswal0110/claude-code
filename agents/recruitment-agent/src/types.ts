/**
 * Type definitions for Recruitment Agent
 */

export type RecruitmentMode = 'jd' | 'screening' | 'interview' | 'comparison' | 'offer';

export interface RecruitmentRequest {
  topic: string;
  mode: RecruitmentMode;
  additionalContext?: string;
}

export interface JobDescription {
  title: string;
  level: string;
  department: string;
  summary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  benefits: string[];
  equalOpportunityStatement: string;
}

export interface ScreeningResult {
  candidateId: string;
  overallScore: number;
  strengthAreas: string[];
  gapAreas: string[];
  recommendation: 'proceed' | 'hold' | 'reject';
  rationale: string;
}

export interface InterviewQuestion {
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'competency';
  competency: string;
  evaluationCriteria: string;
  followUps: string[];
}

export interface CandidateComparison {
  criteria: string[];
  candidates: Array<{
    id: string;
    scores: Record<string, number>;
    strengths: string[];
    concerns: string[];
  }>;
  recommendation: string;
}

export interface OfferLetter {
  candidateName: string;
  position: string;
  compensation: string;
  startDate: string;
  benefits: string;
  terms: string;
}

export interface RecruitmentOutput {
  topic: string;
  mode: RecruitmentMode;
  roleAnalysis: string;
  marketResearch: string;
  content: string;
  biasCheck: string;
  generatedAt: string;
}
