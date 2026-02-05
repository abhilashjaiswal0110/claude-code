/**
 * Type definitions for Marketing & Communication Agent
 */

export type MarketingMode = 'blog' | 'social' | 'campaign' | 'press-release' | 'newsletter';

export interface MarketingRequest {
  topic: string;
  mode: MarketingMode;
  additionalContext?: string;
}

export interface BlogOutput {
  title: string;
  body: string;
  seoKeywords: string[];
  metaDescription: string;
  estimatedReadTime: string;
}

export interface SocialCalendarEntry {
  platform: string;
  date: string;
  content: string;
  hashtags: string[];
  mediaType: string;
}

export interface CampaignBrief {
  objective: string;
  targetAudience: string;
  messaging: string;
  channels: string[];
  timeline: string;
  kpis: string[];
}

export interface PressRelease {
  headline: string;
  subheadline: string;
  body: string;
  boilerplate: string;
  contactInfo: string;
}

export interface NewsletterOutput {
  subjectLines: string[];
  preheader: string;
  body: string;
  ctas: string[];
}

export interface MarketingOutput {
  topic: string;
  mode: MarketingMode;
  researchSummary: string;
  strategy: string;
  content: string;
  optimization: string;
  generatedAt: string;
}
