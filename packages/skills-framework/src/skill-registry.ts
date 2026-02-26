/**
 * Skill Registry
 *
 * Manages a registry of available skills with discovery, registration,
 * and version management capabilities.
 *
 * @see https://github.com/anthropics/claude-cookbooks/blob/main/skills/skill_utils.py
 */

import * as fs from 'fs';
import * as path from 'path';

import type {
  SkillRegistryEntry,
  LoadedSkill,
  SkillCategory,
} from './types.js';
import { SkillLoader, createSkillLoader } from './skill-loader.js';

/**
 * Built-in skill definitions (Anthropic's official skills)
 */
const BUILTIN_SKILLS: SkillRegistryEntry[] = [
  {
    id: 'xlsx',
    displayTitle: 'Excel',
    latestVersion: 'latest',
    createdAt: '2025-10-02',
    updatedAt: '2025-10-02',
    source: 'builtin',
    location: 'anthropic:xlsx',
  },
  {
    id: 'pptx',
    displayTitle: 'PowerPoint',
    latestVersion: 'latest',
    createdAt: '2025-10-02',
    updatedAt: '2025-10-02',
    source: 'builtin',
    location: 'anthropic:pptx',
  },
  {
    id: 'pdf',
    displayTitle: 'PDF',
    latestVersion: 'latest',
    createdAt: '2025-10-02',
    updatedAt: '2025-10-02',
    source: 'builtin',
    location: 'anthropic:pdf',
  },
  {
    id: 'docx',
    displayTitle: 'Word',
    latestVersion: 'latest',
    createdAt: '2025-10-02',
    updatedAt: '2025-10-02',
    source: 'builtin',
    location: 'anthropic:docx',
  },
];

/**
 * Skill Registry options
 */
export interface SkillRegistryOptions {
  /** Base path for custom skills */
  customSkillsPath?: string;

  /** Path to registry persistence file */
  registryPath?: string;

  /** Whether to include built-in skills */
  includeBuiltins?: boolean;

  /** Auto-discover skills on init */
  autoDiscover?: boolean;
}

/**
 * Skill Registry class
 *
 * Central registry for managing available skills.
 */
export class SkillRegistry {
  private entries: Map<string, SkillRegistryEntry> = new Map();
  private loader: SkillLoader;
  private loadedSkills: Map<string, LoadedSkill> = new Map();
  private options: Required<SkillRegistryOptions>;

  constructor(options: SkillRegistryOptions = {}) {
    this.options = {
      customSkillsPath: options.customSkillsPath || './skills',
      registryPath: options.registryPath || './.skill-registry.json',
      includeBuiltins: options.includeBuiltins ?? true,
      autoDiscover: options.autoDiscover ?? false,
    };

    this.loader = createSkillLoader({
      basePath: this.options.customSkillsPath,
    });

    // Initialize with built-in skills
    if (this.options.includeBuiltins) {
      for (const skill of BUILTIN_SKILLS) {
        this.entries.set(skill.id, skill);
      }
    }

    // Load persisted registry
    this.loadRegistry();

    // Auto-discover if enabled
    if (this.options.autoDiscover) {
      this.discoverSkills();
    }
  }

  /**
   * Register a custom skill
   *
   * @param skillPath - Path to skill directory
   * @param displayTitle - Display name for the skill
   * @returns Registration result
   */
  async registerSkill(
    skillPath: string,
    displayTitle?: string
  ): Promise<{ success: boolean; entry?: SkillRegistryEntry; error?: string }> {
    try {
      const validation = await this.loader.validateSkill(skillPath);

      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid skill: ${validation.errors.join(', ')}`,
        };
      }

      const skill = await this.loader.loadSkill(skillPath);
      const id = skill.metadata.name;

      const entry: SkillRegistryEntry = {
        id,
        displayTitle: displayTitle || skill.metadata.displayName,
        latestVersion: skill.metadata.version,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'custom',
        location: skillPath,
      };

      this.entries.set(id, entry);
      this.loadedSkills.set(id, skill);

      // Persist registry
      this.saveRegistry();

      return { success: true, entry };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Unregister a skill
   *
   * @param skillId - Skill ID to remove
   * @returns Whether skill was removed
   */
  unregisterSkill(skillId: string): boolean {
    const entry = this.entries.get(skillId);

    if (!entry || entry.source === 'builtin') {
      return false;
    }

    this.entries.delete(skillId);
    this.loadedSkills.delete(skillId);
    this.saveRegistry();

    return true;
  }

  /**
   * Get a skill by ID
   *
   * @param skillId - Skill ID
   * @returns Loaded skill or undefined
   */
  async getSkill(skillId: string): Promise<LoadedSkill | undefined> {
    // Check if already loaded
    if (this.loadedSkills.has(skillId)) {
      return this.loadedSkills.get(skillId);
    }

    // Check registry
    const entry = this.entries.get(skillId);
    if (!entry) {
      return undefined;
    }

    // Can't load built-in skills locally
    if (entry.source === 'builtin') {
      return undefined;
    }

    // Load the skill
    try {
      const skill = await this.loader.loadSkill(entry.location);
      this.loadedSkills.set(skillId, skill);
      return skill;
    } catch {
      return undefined;
    }
  }

  /**
   * List all registered skills
   *
   * @param filter - Optional filter criteria
   * @returns Array of registry entries
   */
  listSkills(filter?: {
    source?: 'builtin' | 'custom' | 'marketplace';
    category?: SkillCategory;
    search?: string;
  }): SkillRegistryEntry[] {
    let entries = Array.from(this.entries.values());

    if (filter?.source) {
      entries = entries.filter(e => e.source === filter.source);
    }

    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      entries = entries.filter(e =>
        e.displayTitle.toLowerCase().includes(searchLower) ||
        e.id.toLowerCase().includes(searchLower)
      );
    }

    return entries.sort((a, b) => a.displayTitle.localeCompare(b.displayTitle));
  }

  /**
   * Discover skills in the custom skills directory
   */
  async discoverSkills(): Promise<SkillRegistryEntry[]> {
    const discovered: SkillRegistryEntry[] = [];

    if (!fs.existsSync(this.options.customSkillsPath)) {
      return discovered;
    }

    const items = fs.readdirSync(this.options.customSkillsPath);

    for (const item of items) {
      if (item.startsWith('.')) continue;

      const itemPath = path.join(this.options.customSkillsPath, item);
      const skillMdPath = path.join(itemPath, 'SKILL.md');

      if (fs.statSync(itemPath).isDirectory() && fs.existsSync(skillMdPath)) {
        // Check if already registered
        const existingEntry = Array.from(this.entries.values()).find(
          e => e.location === itemPath
        );

        if (!existingEntry) {
          const result = await this.registerSkill(itemPath);
          if (result.success && result.entry) {
            discovered.push(result.entry);
          }
        }
      }
    }

    return discovered;
  }

  /**
   * Get skill container configuration for API use
   *
   * @param skillIds - Skills to include in container
   * @returns Container configuration object
   */
  buildContainerConfig(skillIds: string[]): {
    skills: Array<{ type: string; skill_id: string; version: string }>;
  } {
    const skills: Array<{ type: string; skill_id: string; version: string }> = [];

    for (const id of skillIds) {
      const entry = this.entries.get(id);
      if (entry) {
        skills.push({
          type: entry.source === 'builtin' ? 'anthropic' : 'custom',
          skill_id: entry.id,
          version: entry.latestVersion,
        });
      }
    }

    return { skills };
  }

  /**
   * Load persisted registry from disk
   */
  private loadRegistry(): void {
    if (!fs.existsSync(this.options.registryPath)) {
      return;
    }

    try {
      const data = fs.readFileSync(this.options.registryPath, 'utf-8');
      const entries: SkillRegistryEntry[] = JSON.parse(data);

      for (const entry of entries) {
        // Don't override built-in skills
        if (!this.entries.has(entry.id) || this.entries.get(entry.id)?.source !== 'builtin') {
          this.entries.set(entry.id, entry);
        }
      }
    } catch {
      // Ignore load errors
    }
  }

  /**
   * Save registry to disk
   */
  private saveRegistry(): void {
    const customEntries = Array.from(this.entries.values()).filter(
      e => e.source === 'custom'
    );

    try {
      fs.writeFileSync(
        this.options.registryPath,
        JSON.stringify(customEntries, null, 2),
        'utf-8'
      );
    } catch {
      // Ignore save errors
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    builtin: number;
    custom: number;
    loaded: number;
  } {
    const entries = Array.from(this.entries.values());
    return {
      total: entries.length,
      builtin: entries.filter(e => e.source === 'builtin').length,
      custom: entries.filter(e => e.source === 'custom').length,
      loaded: this.loadedSkills.size,
    };
  }

  /**
   * Clear loaded skills from memory
   */
  clearLoadedSkills(): void {
    this.loadedSkills.clear();
    this.loader.clearCache();
  }
}

/**
 * Create a skill registry instance
 */
export function createSkillRegistry(options?: SkillRegistryOptions): SkillRegistry {
  return new SkillRegistry(options);
}
