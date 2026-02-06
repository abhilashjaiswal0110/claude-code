/**
 * Type definitions for Accessibility Compliance Agent
 */

export type AccessibilityMode =
  | 'wcag-audit'
  | 'remediation-plan'
  | 'alt-text'
  | 'aria-review'
  | 'compliance-report';

export interface AccessibilityRequest {
  topic: string;
  mode: AccessibilityMode;
  additionalContext?: string;
}

export interface WCAGAudit {
  url?: string;
  conformanceLevel: 'A' | 'AA' | 'AAA';
  passedCriteria: string[];
  failedCriteria: string[];
  warnings: string[];
  criticalIssues: string[];
  score?: number;
  recommendations: string[];
}

export interface RemediationPlan {
  issue: string;
  wcagCriteria: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  affectedUsers: string[];
  currentState: string;
  requiredFix: string;
  codeExample?: string;
  testingMethod: string;
  priority: number;
  estimatedEffort: string;
}

export interface AltTextSuggestion {
  imageDescription: string;
  suggestedAltText: string;
  context: string;
  isDecorative: boolean;
  wcagGuidance: string;
}

export interface ARIAReview {
  element: string;
  currentARIA: string;
  issues: string[];
  recommendedARIA: string;
  rationale: string;
  pattern: string;
}

export interface ComplianceReport {
  scope: string;
  standardsTested: string[];
  conformanceLevel: string;
  overallStatus: 'compliant' | 'partially-compliant' | 'non-compliant';
  summary: string;
  criticalFindings: string[];
  detailedFindings: string[];
  remediationPriorities: string[];
  certificationReadiness: string;
}

export interface AccessibilityOutput {
  topic: string;
  mode: AccessibilityMode;
  scopeAnalysis: string;
  technicalReview: string;
  recommendations: string;
  complianceVerification: string;
  generatedAt: string;
}
