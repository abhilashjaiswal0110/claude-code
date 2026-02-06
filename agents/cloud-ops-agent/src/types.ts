/**
 * Type definitions for Cloud Operations Agent
 */

export type CloudOpsMode =
  | 'cost-optimization'
  | 'incident-response'
  | 'capacity-planning'
  | 'architecture-review'
  | 'migration-assessment';

export interface CloudOpsRequest {
  topic: string;
  mode: CloudOpsMode;
  additionalContext?: string;
}

export interface CostOptimization {
  currentSpend: string;
  wasteIdentified: string[];
  rightSizingOpportunities: string[];
  reservedInstanceRecommendations: string[];
  spotInstanceCandidates: string[];
  storageOptimization: string[];
  networkOptimization: string[];
  projectedSavings: string;
  implementationPriority: string[];
}

export interface IncidentResponse {
  incidentSummary: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  affectedServices: string[];
  rootCause: string;
  timeline: string[];
  mitigationSteps: string[];
  preventionMeasures: string[];
  postmortemFindings: string;
}

export interface CapacityPlan {
  currentUtilization: string;
  growthProjections: string;
  bottlenecks: string[];
  scalingRecommendations: string[];
  costImplications: string;
  autoScalingConfig: string;
  reserveCapacity: string;
}

export interface ArchitectureReview {
  currentArchitecture: string;
  wellArchitectedFindings: {
    operationalExcellence: string[];
    security: string[];
    reliability: string[];
    performanceEfficiency: string[];
    costOptimization: string[];
    sustainability: string[];
  };
  risks: string[];
  recommendations: string[];
  prioritizedBacklog: string[];
}

export interface MigrationAssessment {
  sourceEnvironment: string;
  targetCloud: string;
  workloadAnalysis: string[];
  migrationStrategy: MigrationStrategy[];
  dependencies: string[];
  risks: string[];
  timeline: string;
  costEstimate: string;
  checklist: string[];
}

export type MigrationStrategy = 'rehost' | 'replatform' | 'refactor' | 'repurchase' | 'retire' | 'retain';

export interface CloudOpsOutput {
  topic: string;
  mode: CloudOpsMode;
  discovery: string;
  analysis: string;
  recommendations: string;
  operationalReview: string;
  generatedAt: string;
}
