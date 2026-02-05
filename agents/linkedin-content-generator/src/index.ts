/**
 * LinkedIn Content Generator Agent
 *
 * An AI agent that researches topics and generates LinkedIn content
 * in Abhilash Jaiswal's professional persona.
 *
 * @author Abhilash Jaiswal
 * @see https://in.linkedin.com/in/jaiswal-abhilash
 */

import 'dotenv/config';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { ABHILASH_PERSONA } from './persona.js';
import {
  RESEARCH_PROMPT,
  FULL_GENERATION_PROMPT
} from './prompts.js';
import type {
  ContentRequest,
  GeneratedContent,
  LinkedInPost,
  ImageSuggestion,
  SchedulingRecommendation
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

/**
 * Main function to generate LinkedIn content
 */
async function generateLinkedInContent(
  request: ContentRequest
): Promise<GeneratedContent> {
  const { topic, additionalContext } = request;

  console.log('\n========================================');
  console.log('LinkedIn Content Generator Agent');
  console.log('========================================');
  console.log(`\nTopic: ${topic}`);
  if (additionalContext) {
    console.log(`Context: ${additionalContext}`);
  }
  console.log('\n----------------------------------------');

  // Step 1: Research the topic
  console.log('\n[Step 1/2] Researching topic...\n');

  let researchResults = '';

  for await (const message of query({
    prompt: `${RESEARCH_PROMPT}

Research the following topic thoroughly:
Topic: ${topic}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Use web search to find current information, trends, statistics, and expert perspectives.
Compile a comprehensive research summary that can be used for LinkedIn content creation.`,
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: 'You are a research assistant gathering insights for professional LinkedIn content creation. Focus on finding recent, credible sources with actionable insights.'
      },
      allowedTools: ['WebSearch'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 15,
      maxBudgetUsd: 2.0
    }
  })) {
    if (message.type === 'assistant' && message.message.content) {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          process.stdout.write('.');
        }
      }
    }
    if ('result' in message && message.type === 'result') {
      researchResults = message.result;
    }
  }

  console.log('\n\n[Research completed]');
  console.log('\n----------------------------------------');

  // Step 2: Generate content based on research
  console.log('\n[Step 2/2] Generating LinkedIn content...\n');

  let finalContent = '';

  for await (const message of query({
    prompt: `${FULL_GENERATION_PROMPT}

## RESEARCH FINDINGS:
${researchResults}

## TOPIC:
${topic}

## TASK:
Based on the research above, create a complete LinkedIn content package including:
1. Two post variations (hook-focused and value-focused)
2. Image suggestions
3. Scheduling recommendations

Format the output clearly so it can be directly copied to LinkedIn.

Remember: You are writing as ${ABHILASH_PERSONA.name}, ${ABHILASH_PERSONA.title}.
Match the professional thought-leadership tone.`,
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: `You are a professional content writer creating LinkedIn posts as ${ABHILASH_PERSONA.name}, ${ABHILASH_PERSONA.title}. Write with authority on technology leadership topics.`
      },
      allowedTools: [],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 5
    }
  })) {
    if (message.type === 'assistant' && message.message.content) {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          process.stdout.write('.');
        }
      }
    }
    if ('result' in message && message.type === 'result') {
      finalContent = message.result;
    }
  }

  console.log('\n\n[Content generation completed]');
  console.log('\n========================================');
  console.log('GENERATED CONTENT');
  console.log('========================================\n');
  console.log(finalContent);
  console.log('\n========================================');

  // Return structured content
  const generatedContent: GeneratedContent = {
    topic,
    researchSummary: researchResults,
    posts: parsePostsFromContent(finalContent),
    imageSuggestions: parseImageSuggestionsFromContent(finalContent),
    scheduling: parseSchedulingFromContent(finalContent),
    generatedAt: new Date().toISOString()
  };

  // Save output to files
  const outputPath = saveOutputToFiles(topic, generatedContent, finalContent);
  console.log(`\n[Saved] Output saved to: ${outputPath}`);

  return generatedContent;
}

/**
 * Parse posts from generated content
 */
function parsePostsFromContent(content: string): LinkedInPost[] {
  // Returns placeholder structure - actual parsing from AI output
  return [
    {
      variation: 'hook-focused',
      content: extractSection(content, 'Variation 1', 'Variation 2') || content,
      hashtags: extractHashtags(content),
      characterCount: content.length,
      estimatedReadTime: `${Math.ceil(content.split(' ').length / 200)} min`
    },
    {
      variation: 'value-focused',
      content: extractSection(content, 'Variation 2', 'Image') || content,
      hashtags: extractHashtags(content),
      characterCount: content.length,
      estimatedReadTime: `${Math.ceil(content.split(' ').length / 200)} min`
    }
  ];
}

/**
 * Extract section between markers
 */
function extractSection(
  content: string,
  startMarker: string,
  endMarker: string
): string {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1) return '';
  if (endIndex === -1) return content.slice(startIndex);

  return content.slice(startIndex, endIndex).trim();
}

/**
 * Extract hashtags from content
 */
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#\w+/g;
  const matches = content.match(hashtagRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Parse image suggestions from content
 */
function parseImageSuggestionsFromContent(_content: string): ImageSuggestion[] {
  // Returns structured placeholder - actual content is in the text output
  return [
    {
      description: 'See generated content above for detailed image suggestions',
      keywords: ['technology', 'AI', 'innovation'],
      source: 'ai-generated',
      altText: 'Professional technology illustration'
    }
  ];
}

/**
 * Parse scheduling from content
 */
function parseSchedulingFromContent(_content: string): SchedulingRecommendation {
  // Returns default recommendation - actual details in text output
  return {
    bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
    bestTimes: ['8:00-9:00 AM IST', '12:00-1:00 PM IST', '6:00-7:00 PM IST'],
    timezone: 'IST (with global consideration)',
    reasoning: 'See generated content above for detailed scheduling rationale'
  };
}

/**
 * Generate a slug from topic for filename
 */
function generateSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Save generated content to output files
 */
function saveOutputToFiles(
  topic: string,
  content: GeneratedContent,
  rawContent: string
): string {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = generateSlug(topic);
  const baseFilename = `${timestamp}_${slug}`;

  // Save LinkedIn-ready posts (pastable format)
  const linkedInReadyContent = formatLinkedInReadyOutput(topic, rawContent, content);
  const mainFilePath = join(OUTPUT_DIR, `${baseFilename}_linkedin-ready.txt`);
  writeFileSync(mainFilePath, linkedInReadyContent, 'utf-8');

  // Save full JSON for programmatic use
  const jsonFilePath = join(OUTPUT_DIR, `${baseFilename}_full.json`);
  writeFileSync(jsonFilePath, JSON.stringify(content, null, 2), 'utf-8');

  return mainFilePath;
}

/**
 * Format content for direct LinkedIn paste
 */
function formatLinkedInReadyOutput(
  topic: string,
  rawContent: string,
  content: GeneratedContent
): string {
  const divider = '═'.repeat(60);
  const subDivider = '─'.repeat(60);

  return `${divider}
LINKEDIN CONTENT - READY TO PASTE
${divider}

Topic: ${topic}
Generated: ${content.generatedAt}
Author: ${ABHILASH_PERSONA.name}

${divider}

${rawContent}

${divider}
QUICK REFERENCE
${divider}

BEST POSTING TIMES:
${content.scheduling.bestDays.map(d => `  • ${d}`).join('\n')}

TIME SLOTS (IST):
${content.scheduling.bestTimes.map(t => `  • ${t}`).join('\n')}

${subDivider}

HOW TO USE:
1. Copy the post variation you prefer (above)
2. Paste directly into LinkedIn's post editor
3. Add your image (see suggestions above)
4. Schedule or post at recommended times

${divider}
Generated by LinkedIn Content Generator Agent
https://linkedin.com/in/jaiswal-abhilash
${divider}
`;
}

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n[Error] ANTHROPIC_API_KEY not found in environment.');
    console.error('');
    console.error('To fix this:');
    console.error('  1. Copy .env.example to .env');
    console.error('  2. Add your API key from https://console.anthropic.com/');
    console.error('');
    process.exit(1);
  }
}

/**
 * Interactive CLI entry point
 */
async function main(): Promise<void> {
  // Validate environment before proceeding
  validateEnvironment();

  // Get topic from command line arguments or use default
  const args = process.argv.slice(2);
  const topic = args.join(' ') || 'The Rise of AI Agents in Enterprise: Transforming Business Operations';

  console.log('\n');
  console.log('  _     _       _            _ _____ _   _');
  console.log(' | |   (_)_ __ | | _____  __| |_   _| \\ | |');
  console.log(' | |   | | \'_ \\| |/ / _ \\/ _` | | | |  \\| |');
  console.log(' | |___| | | | |   <  __/ (_| |_| |_| |\\  |');
  console.log(' |_____|_|_| |_|_|\\_\\___|\\__,_(_)_(_)_| \\_|');
  console.log('');
  console.log('  Content Generator for Abhilash Jaiswal');
  console.log('  https://linkedin.com/in/jaiswal-abhilash');
  console.log('\n');

  try {
    await generateLinkedInContent({
      topic,
      additionalContext: 'Focus on practical enterprise applications and real-world impact'
    });

    console.log('\n[Done] Content generated successfully!');
    console.log('Copy the content above directly to your LinkedIn post editor.\n');
  } catch (error) {
    console.error('\n[Error] Failed to generate content:', error);
    process.exit(1);
  }
}

// Run the agent
main();
