/**
 * Type definitions for Learning & Development Agent
 */

export type LDMode = 'skill-gap' | 'learning-path' | 'training' | 'assessment' | 'team-matrix';

export interface LDRequest {
  topic: string;
  mode: LDMode;
  additionalContext?: string;
}

export interface SkillGapAnalysis {
  currentSkills: string[];
  requiredSkills: string[];
  gaps: Array<{
    skill: string;
    currentLevel: string;
    requiredLevel: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendations: string[];
}

export interface LearningPath {
  title: string;
  targetRole: string;
  duration: string;
  phases: Array<{
    name: string;
    duration: string;
    topics: string[];
    resources: string[];
    milestones: string[];
  }>;
  certifications: string[];
}

export interface TrainingRecommendation {
  title: string;
  provider: string;
  type: 'course' | 'book' | 'lab' | 'certification' | 'workshop';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  relevance: string;
}

export interface AssessmentQuestion {
  question: string;
  type: 'multiple-choice' | 'scenario' | 'practical' | 'open-ended';
  difficulty: 'easy' | 'medium' | 'hard';
  competency: string;
  expectedAnswer?: string;
}

export interface TeamSkillMatrix {
  teamName: string;
  skills: string[];
  members: Array<{
    role: string;
    skillLevels: Record<string, number>;
  }>;
  gaps: string[];
  upskillPlan: string;
}

export interface LDOutput {
  topic: string;
  mode: LDMode;
  profileAnalysis: string;
  marketResearch: string;
  gapAnalysis: string;
  learningPlan: string;
  generatedAt: string;
}
