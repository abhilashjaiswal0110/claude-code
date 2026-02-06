/**
 * Type definitions for Sustainability Agent
 */

export type SustainabilityMode =
  | 'carbon-footprint'
  | 'green-it'
  | 'sustainability-report'
  | 'energy-optimization'
  | 'esg-compliance';

export interface SustainabilityRequest {
  topic: string;
  mode: SustainabilityMode;
  additionalContext?: string;
}

export interface CarbonFootprintAnalysis {
  scope1Emissions: string;
  scope2Emissions: string;
  scope3Emissions: string;
  totalFootprint: string;
  methodology: string;
  recommendations: string[];
  baselineYear?: string;
  reductionTargets?: string[];
}

export interface GreenITStrategy {
  currentState: string;
  opportunities: string[];
  quickWins: string[];
  longTermInitiatives: string[];
  expectedSavings: string;
  implementationRoadmap: string;
}

export interface SustainabilityReport {
  executiveSummary: string;
  environmentalMetrics: string;
  socialMetrics: string;
  governanceMetrics: string;
  progressAgainstTargets: string;
  futureCommitments: string;
}

export interface EnergyOptimization {
  currentConsumption: string;
  inefficiencies: string[];
  optimizationStrategies: string[];
  projectedSavings: string;
  implementationPriority: string[];
  monitoringRecommendations: string;
}

export interface ESGCompliance {
  frameworksApplicable: string[];
  currentCompliance: string;
  gaps: string[];
  remediationPlan: string;
  reportingRequirements: string[];
  timeline: string;
}

export interface SustainabilityOutput {
  topic: string;
  mode: SustainabilityMode;
  assessment: string;
  dataCollection: string;
  analysis: string;
  complianceReview: string;
  generatedAt: string;
}
