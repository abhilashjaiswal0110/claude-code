/**
 * Type definitions for LinkedIn Content Generator Agent
 */

export interface LinkedInPersona {
  name: string;
  title: string;
  company: string;
  expertise: string[];
  writingStyle: WritingStyle;
  linkedInHandle: string;
}

export interface WritingStyle {
  tone: 'professional' | 'conversational' | 'thought-leadership';
  characteristics: string[];
  avoidances: string[];
}

export interface ContentRequest {
  topic: string;
  additionalContext?: string;
}

export interface ImageSuggestion {
  description: string;
  keywords: string[];
  source: 'stock' | 'ai-generated' | 'infographic';
  altText: string;
}

export interface SchedulingRecommendation {
  bestDays: string[];
  bestTimes: string[];
  timezone: string;
  reasoning: string;
}

export interface LinkedInPost {
  variation: 'hook-focused' | 'value-focused';
  content: string;
  hashtags: string[];
  characterCount: number;
  estimatedReadTime: string;
}

export interface GeneratedContent {
  topic: string;
  researchSummary: string;
  posts: LinkedInPost[];
  imageSuggestions: ImageSuggestion[];
  scheduling: SchedulingRecommendation;
  generatedAt: string;
}
