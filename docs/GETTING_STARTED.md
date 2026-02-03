# Getting Started with Claude Code

## Overview

Claude Code is an agentic coding assistant that lives in your terminal and IDE, helping you understand codebases, execute routine tasks, and handle git workflows through natural language commands.

This repository contains **Claude Code plugins** - extensions that enhance Claude Code with custom commands, specialized agents, hooks, and workflows.

## Prerequisites

Before using Claude Code, ensure you have:

1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **Git** - For version control operations
3. **An Anthropic API key** - Required for Claude Code to function
4. **Terminal access** - PowerShell (Windows), bash/zsh (macOS/Linux)

## Installation

### Step 1: Install Node.js

**Windows:**
1. Download the LTS version from [nodejs.org](https://nodejs.org/)
2. Run the installer (includes npm)
3. Verify installation:
```powershell
node --version
npm --version
```

**macOS/Linux:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Step 2: Install Claude Code

Choose one of the recommended installation methods:

**Windows (Recommended):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows (WinGet):**
```powershell
winget install Anthropic.ClaudeCode
```

**macOS/Linux (Recommended):**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**macOS/Linux (Homebrew):**
```bash
brew install --cask claude-code
```

**NPM (Deprecated but works):**
```bash
npm install -g @anthropic-ai/claude-code
```

### Step 3: Verify Installation

```bash
claude --version
```

You should see the Claude Code version number.

### Step 4: Set Up API Key

Claude Code requires an Anthropic API key. You'll be prompted to set it up on first run:

```bash
claude
```

Follow the interactive setup to:
1. Enter your Anthropic API key
2. Choose your preferred model (Claude Sonnet 4.5 recommended)
3. Configure settings

**Or set it manually:**
```bash
# Windows
$env:ANTHROPIC_API_KEY="your-api-key-here"

# macOS/Linux
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Quick Start

### Basic Usage

1. Navigate to any project directory:
```bash
cd your-project-directory
```

2. Start Claude Code:
```bash
claude
```

3. Interact with natural language:
```
> Explain what this codebase does
> Find all TODO comments
> Create a new feature for user authentication
> Review my recent changes
```

### Using Plugins from This Repository

This repository contains multiple plugins that extend Claude Code's capabilities. Each plugin is in the `plugins/` directory.

**To use these plugins in your projects:**

1. **Copy plugin to your project:**
```bash
# From this repository directory
cp -r plugins/hookify path/to/your-project/.claude/plugins/hookify
```

2. **Or reference via marketplace:**
Configure your project's `.claude/settings.json` to reference this repository's plugin marketplace.

3. **Use plugin commands:**
```bash
claude
> /hookify
> /commit-push-pr
> /feature-dev
```

## Repository Structure

```
claude-code/
├── docs/                          # Documentation (you are here!)
│   ├── GETTING_STARTED.md        # This file
│   ├── PLUGIN_GUIDE.md           # Using plugins
│   ├── EXAMPLES.md               # Usage examples
│   └── TROUBLESHOOTING.md        # Common issues
├── plugins/                       # Plugin collection
│   ├── hookify/                  # Custom hooks creation
│   ├── feature-dev/              # Feature development workflow
│   ├── commit-commands/          # Git workflow automation
│   ├── pr-review-toolkit/        # PR review agents
│   ├── code-review/              # Automated code review
│   ├── plugin-dev/               # Plugin development toolkit
│   ├── agent-sdk-dev/            # Agent SDK development
│   └── ... (12+ plugins total)
├── examples/                      # Example configurations
└── scripts/                       # Utility scripts
```

## Key Features

### 1. Natural Language Interface
Ask questions and give commands in plain English:
- "What does this function do?"
- "Find all files that use authentication"
- "Create a test for the login function"

### 2. Codebase Understanding
Claude Code can:
- Navigate and explain complex codebases
- Find patterns and dependencies
- Suggest improvements

### 3. Automated Workflows
Use slash commands for common tasks:
- `/commit` - Smart git commits
- `/feature-dev` - Structured feature development
- `/code-review` - Automated PR reviews

### 4. Custom Plugins
Extend functionality with plugins:
- Custom commands
- Specialized agents
- Event hooks
- MCP server integrations

## Next Steps

1. **[Read the Plugin Guide](./PLUGIN_GUIDE.md)** - Learn about available plugins
2. **[See Examples](./EXAMPLES.md)** - Common usage patterns
3. **[Troubleshooting](./TROUBLESHOOTING.md)** - Fix common issues
4. **[Official Documentation](https://code.claude.com/docs)** - Complete reference

## Learn More

- **Official Docs:** https://code.claude.com/docs
- **Discord Community:** https://anthropic.com/discord
- **GitHub Issues:** https://github.com/anthropics/claude-code/issues
- **Data Usage:** https://code.claude.com/docs/en/data-usage

## Getting Help

- Use `/bug` command within Claude Code to report issues
- Join the Discord community
- Check the [Troubleshooting guide](./TROUBLESHOOTING.md)
- File a GitHub issue

---

**Ready to code with Claude?** Navigate to your project and run `claude`!
