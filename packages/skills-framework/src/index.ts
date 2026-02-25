/**
 * @enterprise-agents/skills-framework
 *
 * Skills architecture framework for progressive capability loading
 * and custom skill development. Inspired by Anthropic's skills system.
 *
 * Features:
 * - Progressive disclosure for token-efficient skill loading
 * - Custom skill development support
 * - Skill registry and discovery
 * - Execution context management
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/skills
 */

// Types
export type {
  SkillMetadata,
  SkillCategory,
  SkillStructure,
  SkillFile,
  LoadedSkill,
  SkillLoadOptions,
  SkillRegistryEntry,
  SkillExecutionContext,
  SkillExecutionResult,
  GeneratedFile,
  DisclosureStage,
  SkillContainerConfig,
  SkillValidationResult,
} from './types.js';

// Skill Loader
export {
  SkillLoader,
  createSkillLoader,
} from './skill-loader.js';

// Skill Registry
export {
  SkillRegistry,
  createSkillRegistry,
  type SkillRegistryOptions,
} from './skill-registry.js';

// Skill Executor
export {
  SkillExecutor,
  createSkillExecutor,
  type SkillExecutionOptions,
} from './skill-executor.js';

/**
 * Quick skill loading helper
 *
 * @param skillPath - Path to skill directory
 * @returns Loaded skill
 *
 * @example
 * ```typescript
 * const skill = await loadSkill('./skills/financial-analyzer');
 * console.log(skill.metadata.name);
 * console.log(skill.instructions);
 * ```
 */
export async function loadSkill(skillPath: string): Promise<import('./types.js').LoadedSkill> {
  const loader = new (await import('./skill-loader.js')).SkillLoader();
  return loader.loadSkill(skillPath);
}

/**
 * Create a skill from SKILL.md content
 *
 * @param content - SKILL.md content string
 * @returns Parsed metadata and instructions
 *
 * @example
 * ```typescript
 * const { metadata, instructions } = parseSkillMd(`
 * ---
 * name: my-skill
 * description: A custom skill
 * ---
 *
 * # Instructions
 * ...
 * `);
 * ```
 */
export function parseSkillMd(content: string): {
  metadata: import('./types.js').SkillMetadata;
  instructions: string;
} {
  const { SkillLoader } = require('./skill-loader.js');
  const loader = new SkillLoader();
  return loader.parseSkillMd(content);
}

/**
 * Validate a skill directory
 *
 * @param skillPath - Path to skill directory
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = await validateSkill('./my-skill');
 * if (!result.valid) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export async function validateSkill(
  skillPath: string
): Promise<import('./types.js').SkillValidationResult> {
  const loader = new (await import('./skill-loader.js')).SkillLoader();
  return loader.validateSkill(skillPath);
}

/**
 * Generate a SKILL.md template
 *
 * @param metadata - Skill metadata
 * @returns SKILL.md content
 *
 * @example
 * ```typescript
 * const content = generateSkillTemplate({
 *   name: 'my-skill',
 *   displayName: 'My Custom Skill',
 *   description: 'Does something useful',
 *   category: 'automation',
 * });
 * ```
 */
export function generateSkillTemplate(
  metadata: Partial<import('./types.js').SkillMetadata>
): string {
  const yaml = require('yaml');

  const frontmatter = yaml.stringify({
    name: metadata.name || 'my-skill',
    displayName: metadata.displayName || 'My Skill',
    description: metadata.description || 'A custom skill',
    version: metadata.version || '1.0.0',
    author: metadata.author,
    category: metadata.category || 'custom',
    tags: metadata.tags || [],
    requiredTools: metadata.requiredTools || [],
  });

  return `---
${frontmatter.trim()}
---

# ${metadata.displayName || 'My Skill'}

${metadata.description || 'Description of what this skill does.'}

## When to Use

Describe when this skill should be invoked.

## Instructions

Detailed instructions for Claude on how to perform this skill.

### Step 1: Gather Information

First, understand the user's requirements...

### Step 2: Execute Task

Then, perform the main task...

### Step 3: Validate Output

Finally, verify the output meets requirements...

## Examples

### Example 1: Basic Usage

User: "Create a simple report"
Response: ...

## Notes

- Any important notes or caveats
- Known limitations
`;
}

/**
 * Create a new skill directory structure
 *
 * @param basePath - Path where skill directory should be created
 * @param metadata - Skill metadata
 *
 * @example
 * ```typescript
 * await createSkillDirectory('./skills', {
 *   name: 'financial-analyzer',
 *   displayName: 'Financial Analyzer',
 *   description: 'Analyzes financial data and generates reports',
 * });
 * ```
 */
export async function createSkillDirectory(
  basePath: string,
  metadata: Partial<import('./types.js').SkillMetadata>
): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  const skillName = metadata.name || 'new-skill';
  const skillDir = path.join(basePath, skillName);

  // Create directories
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(path.join(skillDir, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(skillDir, 'resources'), { recursive: true });

  // Create SKILL.md
  const skillMdContent = generateSkillTemplate(metadata);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent, 'utf-8');

  // Create placeholder files
  fs.writeFileSync(
    path.join(skillDir, 'scripts', 'example.py'),
    '# Example script for this skill\n',
    'utf-8'
  );

  fs.writeFileSync(
    path.join(skillDir, 'resources', '.gitkeep'),
    '',
    'utf-8'
  );

  return skillDir;
}
