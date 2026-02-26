/**
 * Skill Loader
 *
 * Handles loading and parsing of skill packages from directories.
 * Implements progressive disclosure for token-efficient skill loading.
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/skills
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

import type {
  SkillMetadata,
  SkillStructure,
  SkillFile,
  LoadedSkill,
  SkillLoadOptions,
  SkillValidationResult,
  DisclosureStage,
} from './types.js';

/**
 * Default loading options
 */
const DEFAULT_OPTIONS: Required<SkillLoadOptions> = {
  loadScripts: true,
  loadResources: false, // Resources loaded on-demand by default
  includeReference: true,
  maxTokens: 10000,
  basePath: process.cwd(),
};

/**
 * Skill Loader class
 *
 * Provides methods for loading, validating, and managing skills.
 */
export class SkillLoader {
  private options: Required<SkillLoadOptions>;
  private skillCache: Map<string, LoadedSkill> = new Map();

  constructor(options: SkillLoadOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Load a skill from a directory
   *
   * @param skillPath - Path to skill directory
   * @param options - Override loading options
   * @returns Loaded skill instance
   */
  async loadSkill(
    skillPath: string,
    options: SkillLoadOptions = {}
  ): Promise<LoadedSkill> {
    const mergedOptions = { ...this.options, ...options };
    const resolvedPath = path.resolve(mergedOptions.basePath, skillPath);

    // Check cache first
    const cacheKey = `${resolvedPath}:${JSON.stringify(mergedOptions)}`;
    const cached = this.skillCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Validate skill structure
    const validation = await this.validateSkill(resolvedPath);
    if (!validation.valid) {
      throw new Error(`Invalid skill at ${skillPath}: ${validation.errors.join(', ')}`);
    }

    // Load skill structure
    const structure = await this.loadSkillStructure(resolvedPath);

    // Load SKILL.md
    const skillMdContent = fs.readFileSync(structure.skillMdPath, 'utf-8');
    const { metadata, instructions } = this.parseSkillMd(skillMdContent);

    // Load reference if available
    let reference: string | undefined;
    if (mergedOptions.includeReference && structure.referencePath) {
      reference = fs.readFileSync(structure.referencePath, 'utf-8');
    }

    // Load scripts
    const scripts = new Map<string, string>();
    if (mergedOptions.loadScripts && structure.scriptsPath) {
      const scriptFiles = structure.files.filter(f => f.type === 'script');
      for (const file of scriptFiles) {
        const fullPath = path.join(resolvedPath, file.path);
        scripts.set(file.path, fs.readFileSync(fullPath, 'utf-8'));
      }
    }

    // Load resources
    const resources = new Map<string, Buffer | string>();
    if (mergedOptions.loadResources && structure.resourcesPath) {
      const resourceFiles = structure.files.filter(f => f.type === 'resource');
      for (const file of resourceFiles) {
        const fullPath = path.join(resolvedPath, file.path);
        const ext = path.extname(file.path).toLowerCase();
        if (['.txt', '.md', '.json', '.yaml', '.yml', '.csv'].includes(ext)) {
          resources.set(file.path, fs.readFileSync(fullPath, 'utf-8'));
        } else {
          resources.set(file.path, fs.readFileSync(fullPath));
        }
      }
    }

    // Estimate token count
    const tokenEstimate = this.estimateTokens(
      instructions,
      reference,
      scripts,
      resources
    );

    const loadedSkill: LoadedSkill = {
      metadata,
      structure,
      instructions,
      reference,
      scripts,
      resources,
      loadedAt: new Date().toISOString(),
      tokenEstimate,
    };

    // Cache the skill
    this.skillCache.set(cacheKey, loadedSkill);

    return loadedSkill;
  }

  /**
   * Validate a skill directory
   *
   * @param skillPath - Path to skill directory
   * @returns Validation result
   */
  async validateSkill(skillPath: string): Promise<SkillValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let metadata: SkillMetadata | undefined;

    // Check directory exists
    if (!fs.existsSync(skillPath)) {
      errors.push(`Skill directory does not exist: ${skillPath}`);
      return { valid: false, errors, warnings };
    }

    // Check for SKILL.md
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      errors.push('SKILL.md not found (required)');
      return { valid: false, errors, warnings };
    }

    // Parse and validate SKILL.md
    try {
      const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');
      const parsed = this.parseSkillMd(skillMdContent);
      metadata = parsed.metadata;

      // Validate required fields
      if (!metadata.name) {
        errors.push('SKILL.md missing required field: name');
      }
      if (!metadata.description) {
        errors.push('SKILL.md missing required field: description');
      }

      // Validate optional structure
      if (parsed.instructions.length < 50) {
        warnings.push('SKILL.md instructions seem very short');
      }
    } catch (err) {
      errors.push(`Failed to parse SKILL.md: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Check optional directories
    const scriptsPath = path.join(skillPath, 'scripts');
    if (fs.existsSync(scriptsPath) && !fs.statSync(scriptsPath).isDirectory()) {
      warnings.push('scripts path exists but is not a directory');
    }

    const resourcesPath = path.join(skillPath, 'resources');
    if (fs.existsSync(resourcesPath) && !fs.statSync(resourcesPath).isDirectory()) {
      warnings.push('resources path exists but is not a directory');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Load skill structure information
   */
  private async loadSkillStructure(skillPath: string): Promise<SkillStructure> {
    const files: SkillFile[] = [];

    const walkDir = (dir: string, basePath: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item.startsWith('.')) continue;

        const fullPath = path.join(dir, item);
        const relativePath = path.relative(basePath, fullPath);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          walkDir(fullPath, basePath);
        } else {
          files.push({
            path: relativePath.replace(/\\/g, '/'),
            type: this.getFileType(relativePath),
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        }
      }
    };

    walkDir(skillPath, skillPath);

    const scriptsPath = path.join(skillPath, 'scripts');
    const resourcesPath = path.join(skillPath, 'resources');
    const referencePath = path.join(skillPath, 'REFERENCE.md');

    return {
      skillMdPath: path.join(skillPath, 'SKILL.md'),
      scriptsPath: fs.existsSync(scriptsPath) ? scriptsPath : undefined,
      resourcesPath: fs.existsSync(resourcesPath) ? resourcesPath : undefined,
      referencePath: fs.existsSync(referencePath) ? referencePath : undefined,
      files,
    };
  }

  /**
   * Determine file type from path
   */
  private getFileType(filePath: string): SkillFile['type'] {
    const normalized = filePath.toLowerCase();

    if (normalized.endsWith('.md')) return 'markdown';
    if (normalized.startsWith('scripts/')) return 'script';
    if (normalized.startsWith('resources/')) return 'resource';
    if (normalized.endsWith('.json') || normalized.endsWith('.yaml') || normalized.endsWith('.yml')) {
      return 'config';
    }

    return 'other';
  }

  /**
   * Parse SKILL.md content into metadata and instructions
   */
  parseSkillMd(content: string): { metadata: SkillMetadata; instructions: string } {
    // Check for YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const instructions = frontmatterMatch[2].trim();

      try {
        const parsed = yaml.parse(frontmatter);
        const metadata: SkillMetadata = {
          name: parsed.name || '',
          displayName: parsed.displayName || parsed.display_name || parsed.name || '',
          description: parsed.description || '',
          version: parsed.version || '1.0.0',
          author: parsed.author,
          category: parsed.category,
          tags: parsed.tags,
          dependencies: parsed.dependencies,
          requiredTools: parsed.requiredTools || parsed.required_tools,
          minModelVersion: parsed.minModelVersion || parsed.min_model_version,
          experimental: parsed.experimental,
        };

        return { metadata, instructions };
      } catch (err) {
        throw new Error(`Failed to parse SKILL.md frontmatter: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // No frontmatter, extract metadata from headers
    const nameMatch = content.match(/^#\s+(.+)/m);
    const descMatch = content.match(/^>\s*(.+)/m);

    return {
      metadata: {
        name: nameMatch?.[1]?.trim() || 'unnamed-skill',
        displayName: nameMatch?.[1]?.trim() || 'Unnamed Skill',
        description: descMatch?.[1]?.trim() || '',
        version: '1.0.0',
      },
      instructions: content,
    };
  }

  /**
   * Estimate token count for skill content
   */
  private estimateTokens(
    instructions: string,
    reference?: string,
    scripts?: Map<string, string>,
    resources?: Map<string, Buffer | string>
  ): number {
    let totalChars = instructions.length;

    if (reference) {
      totalChars += reference.length;
    }

    if (scripts) {
      for (const script of scripts.values()) {
        totalChars += script.length;
      }
    }

    if (resources) {
      for (const resource of resources.values()) {
        if (typeof resource === 'string') {
          totalChars += resource.length;
        }
      }
    }

    // Rough estimate: ~4 chars per token
    return Math.ceil(totalChars / 4);
  }

  /**
   * Build progressive disclosure stages for a skill
   *
   * @param skill - Loaded skill
   * @param maxTokensPerStage - Maximum tokens per stage
   * @returns Array of disclosure stages
   */
  buildDisclosureStages(
    skill: LoadedSkill,
    _maxTokensPerStage: number = 2000
  ): DisclosureStage[] {
    const stages: DisclosureStage[] = [];

    // Stage 1: Core instructions (always required)
    stages.push({
      name: 'core-instructions',
      content: skill.instructions,
      tokens: Math.ceil(skill.instructions.length / 4),
      required: true,
      trigger: 'immediate',
    });

    // Stage 2: Reference documentation (on-demand)
    if (skill.reference) {
      stages.push({
        name: 'reference-docs',
        content: skill.reference,
        tokens: Math.ceil(skill.reference.length / 4),
        required: false,
        trigger: 'on-demand',
      });
    }

    // Stage 3+: Scripts (on-demand)
    for (const [name, content] of skill.scripts) {
      stages.push({
        name: `script:${name}`,
        content,
        tokens: Math.ceil(content.length / 4),
        required: false,
        trigger: 'on-demand',
      });
    }

    return stages;
  }

  /**
   * Clear the skill cache
   */
  clearCache(): void {
    this.skillCache.clear();
  }

  /**
   * Get cached skill if available
   */
  getCachedSkill(skillPath: string): LoadedSkill | undefined {
    for (const [key, skill] of this.skillCache) {
      if (key.startsWith(skillPath)) {
        return skill;
      }
    }
    return undefined;
  }
}

/**
 * Create a default skill loader instance
 */
export function createSkillLoader(options?: SkillLoadOptions): SkillLoader {
  return new SkillLoader(options);
}
