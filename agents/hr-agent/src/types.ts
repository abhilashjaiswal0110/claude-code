/**
 * Type definitions for HR Agent
 */

export type HRMode = 'policy' | 'benefits' | 'engagement' | 'onboarding' | 'exit-interview';

export interface HRRequest {
  topic: string;
  mode: HRMode;
  additionalContext?: string;
}

export interface PolicyResponse {
  query: string;
  answer: string;
  references: string[];
  disclaimer: string;
}

export interface BenefitsExplanation {
  benefit: string;
  eligibility: string;
  enrollment: string;
  details: string;
}

export interface EngagementInsight {
  theme: string;
  sentiment: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface OnboardingGuide {
  role: string;
  week1: string[];
  week2: string[];
  month1: string[];
  resources: string[];
}

export interface ExitInterviewSummary {
  patterns: string[];
  topReasons: string[];
  recommendations: string[];
  retentionInsights: string;
}

export interface HROutput {
  topic: string;
  mode: HRMode;
  classification: string;
  policySearch: string;
  response: string;
  complianceCheck: string;
  generatedAt: string;
}
