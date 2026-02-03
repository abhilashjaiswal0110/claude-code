# Claude Code Plugin Guide

**Last Updated:** February 2026

## Table of Contents

- [What are Plugins?](#what-are-plugins)
- [Available Plugins](#available-plugins)
  - [Development Workflow](#-development-workflow) - Hookify, Commit Commands, Feature Dev
  - [Code Review & Quality](#-code-review--quality) - PR Review Toolkit, Code Review
  - [Frontend Development](#-frontend-development) - Frontend Design
  - [Plugin Development](#️-plugin-development) - Plugin Dev
  - [Agent SDK Development](#-agent-sdk-development) - Agent SDK Dev
  - [Migration & Updates](#-migration--updates) - Claude Opus 4.5 Migration
  - [Learning & Style](#-learning--style) - Learning Output Style, Explanatory Output Style
  - [Security](#-security) - Security Guidance
  - [Experimental](#-experimental) - Ralph Wiggum
- [Plugin Structure](#plugin-structure)
- [Installing Plugins](#installing-plugins)
- [Creating Custom Plugins](#creating-custom-plugins)
- [Plugin Components](#plugin-components)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## What are Plugins?

Claude Code plugins are extensions that enhance functionality through:
- **Custom Commands** - Slash commands like `/commit` or `/feature-dev`
- **Specialized Agents** - AI agents with specific expertise
- **Hooks** - Event handlers for lifecycle events
- **Skills** - Reusable knowledge for agents
- **MCP Servers** - External tool integrations

## Available Plugins

### 🔧 Development Workflow

#### [Hookify](../plugins/hookify/)
Create custom hooks to prevent unwanted behaviors without writing code.

**Commands:**
- `/hookify` - Create a rule from conversation analysis or instructions
- `/hookify:list` - Show all active rules
- `/hookify:configure` - Manage rule settings
- `/hookify:help` - Get detailed help

**Example:**
```bash
> /hookify Warn me when I use console.log in production code
> /hookify Don't allow rm -rf commands
> /hookify:list
```

**Use Cases:**
- Prevent dangerous commands
- Enforce coding standards
- Block sensitive file operations
- Warn about deprecated patterns

---

#### [Commit Commands](../plugins/commit-commands/)
Streamlined git workflow automation.

**Commands:**
- `/commit` - Smart commit with AI-generated messages
- `/commit-push-pr` - Commit, push, and create PR in one step
- `/clean_gone` - Clean up local branches deleted on remote

**Example:**
```bash
> /commit
> /commit-push-pr "Add user authentication"
> /clean_gone
```

---

#### [Feature Dev](../plugins/feature-dev/)
Comprehensive feature development workflow with 7 structured phases.

**Command:** `/feature-dev`

**Agents:**
- `code-explorer` - Analyze codebase structure
- `code-architect` - Design architecture
- `code-reviewer` - Quality review

**Workflow:**
1. Requirements gathering
2. Codebase exploration
3. Architecture design
4. Implementation planning
5. Development
6. Testing
7. Review & refinement

**Example:**
```bash
> /feature-dev Add OAuth authentication with Google and GitHub
```

---

### 🔍 Code Review & Quality

#### [PR Review Toolkit](../plugins/pr-review-toolkit/)
Comprehensive PR review with specialized agents for different aspects.

**Command:** `/pr-review-toolkit:review-pr [aspect]`

**Agents:**
- `comment-analyzer` - Documentation and comments
- `pr-test-analyzer` - Test coverage and quality
- `silent-failure-hunter` - Error handling
- `type-design-analyzer` - Type system design
- `code-reviewer` - General code quality
- `code-simplifier` - Simplification opportunities

**Example:**
```bash
> /pr-review-toolkit:review-pr all
> /pr-review-toolkit:review-pr tests
> /pr-review-toolkit:review-pr types
```

---

#### [Code Review](../plugins/code-review/)
Automated PR code review with confidence scoring.

**Command:** `/code-review`

**Features:**
- 5 parallel Sonnet agents
- Confidence-based filtering
- CLAUDE.md compliance
- Bug detection
- Historical context analysis

---

### 🎨 Frontend Development

#### [Frontend Design](../plugins/frontend-design/)
Create distinctive, production-grade frontend interfaces.

**Auto-invoked for frontend work**

**Focus Areas:**
- Bold design choices
- Typography hierarchy
- Animations and transitions
- Visual details
- Avoiding generic AI aesthetics

**Example:**
```bash
> Create a landing page with a modern, distinctive design
```

---

### 🛠️ Plugin Development

#### [Plugin Dev](../plugins/plugin-dev/)
Comprehensive toolkit for developing Claude Code plugins.

**Command:** `/plugin-dev:create-plugin`

**8-Phase Workflow:**
1. Discovery & Planning
2. Structure Setup
3. Command Creation
4. Agent Development
5. Skill Writing
6. Hook Integration
7. Testing
8. Documentation

**Agents:**
- `agent-creator` - Build agents
- `plugin-validator` - Validate plugin structure
- `skill-reviewer` - Review skill quality

**Skills:**
- Hook development
- MCP integration
- Plugin structure
- Settings management
- Command development
- Agent development
- Skill development

---

### 🤖 Agent SDK Development

#### [Agent SDK Dev](../plugins/agent-sdk-dev/)
Development kit for working with Claude Agent SDK.

**Command:** `/new-sdk-app`

**Agents:**
- `agent-sdk-verifier-py` - Validate Python SDK apps
- `agent-sdk-verifier-ts` - Validate TypeScript SDK apps

**Features:**
- Interactive setup
- Best practices validation
- Template generation

---

### 🔄 Migration & Updates

#### [Claude Opus 4.5 Migration](../plugins/claude-opus-4-5-migration/)
Migrate code from Sonnet 4.x and Opus 4.1 to Opus 4.5.

**Skill:** Auto-invoked for migration tasks

**Migrates:**
- Model strings
- Beta headers
- Prompt adjustments
- API changes

---

### 🎓 Learning & Style

#### [Learning Output Style](../plugins/learning-output-style/)
Interactive learning mode encouraging hands-on coding.

**Hook:** Auto-activated at session start

**Features:**
- Requests code contributions at decision points
- Educational insights
- Interactive learning
- 5-10 line code exercises

---

#### [Explanatory Output Style](../plugins/explanatory-output-style/)
Adds educational insights about implementation choices.

**Hook:** Auto-activated at session start

**Features:**
- Explains "why" not just "what"
- Codebase pattern insights
- Implementation rationale

---

### 🔒 Security

#### [Security Guidance](../plugins/security-guidance/)
Security reminder hook for potential vulnerabilities.

**Hook:** PreToolUse monitoring

**Monitors 9 patterns:**
- Command injection
- XSS vulnerabilities
- eval() usage
- Dangerous HTML
- Pickle deserialization
- os.system calls
- Unsafe file operations
- SQL injection
- Path traversal

---

### 🔁 Experimental

#### [Ralph Wiggum](../plugins/ralph-wiggum/)
Interactive self-referential AI loops for iterative development.

**Commands:**
- `/ralph-loop` - Start autonomous iteration
- `/cancel-ralph` - Stop iteration

**Warning:** Experimental! Uses autonomous loops.

---

## Plugin Structure

Every Claude Code plugin follows this structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata & configuration
├── commands/                 # Slash commands (*.md files)
│   ├── command-name.md
│   └── another-command.md
├── agents/                   # Specialized agents (*.md files)
│   ├── agent-name.md
│   └── another-agent.md
├── skills/                   # Agent skills
│   └── skill-name/
│       └── SKILL.md
├── hooks/                    # Event handlers
│   ├── hooks.json           # Hook configuration
│   └── hook-handler.py      # Hook implementation
├── .mcp.json                # MCP server configuration (optional)
└── README.md                # Plugin documentation
```

## Installing Plugins

### Method 1: Copy to Project

```bash
# Copy plugin to your project
cp -r plugins/hookify path/to/your-project/.claude/plugins/hookify
```

### Method 2: Configure Marketplace

Add to your project's `.claude/settings.json`:

```json
{
  "plugins": {
    "marketplaces": [
      {
        "source": "path/to/claude-code/.claude-plugin/marketplace.json"
      }
    ],
    "installed": [
      "hookify",
      "commit-commands",
      "feature-dev"
    ]
  }
}
```

### Method 3: Global Installation

Install plugins globally to use in all projects:

```bash
claude plugin install hookify
```

## Creating Custom Plugins

### Quick Start

1. **Use the Plugin Dev toolkit:**
```bash
> /plugin-dev:create-plugin
```

2. **Or create manually:**
```bash
mkdir -p my-plugin/.claude-plugin
cd my-plugin
```

3. **Create plugin.json:**
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "category": "productivity"
}
```

4. **Add commands, agents, or hooks as needed**

### Plugin Components

#### Commands
Markdown files in `commands/` become slash commands:

```markdown
# Command Name

Brief description.

## Usage

/command-name [arguments]

## Implementation

[Agent instructions or logic]
```

#### Agents
Markdown files in `agents/` define specialized agents:

```markdown
# Agent Name

Role and expertise description.

## Capabilities

- Capability 1
- Capability 2

## Instructions

Detailed instructions for the agent...
```

#### Skills
Reusable knowledge in `skills/skill-name/SKILL.md`:

```markdown
# Skill Name

Expertise area description.

## When to Use

- Use case 1
- Use case 2

## Best Practices

...
```

#### Hooks
Event handlers in `hooks/`:

**hooks.json:**
```json
{
  "PreToolUse": ["pretooluse.py"],
  "PostToolUse": ["posttooluse.py"],
  "SessionStart": ["session-start.sh"],
  "Stop": ["stop.py"]
}
```

**Handler implementation:**
```python
# pretooluse.py
def handle(context):
    tool = context.get('tool')
    if tool == 'run_in_terminal':
        command = context.get('args', {}).get('command', '')
        if 'rm -rf' in command:
            return {
                'action': 'warn',
                'message': 'Warning: Destructive command detected!'
            }
    return {'action': 'allow'}
```

## Best Practices

### Plugin Development
1. **Clear naming** - Use descriptive names for plugins and commands
2. **Good documentation** - Include comprehensive README
3. **Focused scope** - Each plugin should do one thing well
4. **Error handling** - Gracefully handle edge cases
5. **Testing** - Test thoroughly before sharing

### Using Plugins
1. **Start small** - Try one plugin at a time
2. **Read docs** - Check plugin README for usage
3. **Customize** - Modify plugins for your workflow
4. **Share feedback** - Report issues and suggest improvements

## Troubleshooting

### Plugin Not Loading
```bash
# Check plugin structure
ls .claude/plugins/plugin-name/

# Verify plugin.json syntax
cat .claude/plugins/plugin-name/.claude-plugin/plugin.json

# Restart Claude Code
exit
claude
```

### Command Not Found
```bash
# List available commands
/help

# Check plugin is installed
claude plugin list
```

### Hook Not Triggering
```bash
# Verify hooks.json
cat .claude/plugins/plugin-name/hooks/hooks.json

# Check handler file permissions
ls -la .claude/plugins/plugin-name/hooks/
```

## Learn More

- **Official Plugin Docs:** https://docs.claude.com/en/docs/claude-code/plugins
- **Plugin Examples:** See `plugins/` directory
- **Create Your Own:** Use `/plugin-dev:create-plugin`
- **Share:** Submit to community marketplaces

---

**Ready to extend Claude Code?** Start with Hookify or try Plugin Dev!
