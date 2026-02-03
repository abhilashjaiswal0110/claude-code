# Setting Up Claude Code Locally - Step by Step

This guide walks through setting up this Claude Code plugin repository locally and demonstrating its capabilities.

## Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** (required) - Check with `node --version`
- **Claude Code** (required) - Check with `claude --version`
- **Anthropic API Key** (required) - Get from [console.anthropic.com](https://console.anthropic.com/)

## Installation Steps

### 1. Install Node.js

Node.js is required to run Claude Code.

#### Windows Installation

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - Current recommended: v18.x or v20.x

2. **Run the Installer:**
   - Double-click the downloaded .msi file
   - Follow the installation wizard
   - **Important:** Check "Add to PATH" during installation
   - Accept the defaults

3. **Verify Installation:**
   ```powershell
   # Restart PowerShell, then run:
   node --version
   # Should output: v18.x.x or v20.x.x
   
   npm --version
   # Should output: 9.x.x or 10.x.x
   ```

**If the commands aren't recognized:**
- Restart PowerShell/Terminal
- If still not working, manually add to PATH:
  - Search "Environment Variables" in Windows
  - Edit "Path" in System Variables
  - Add: `C:\Program Files\nodejs\`
  - Click OK and restart PowerShell

### 2. Install Claude Code

Once Node.js is installed, install Claude Code globally.

#### Option A: Recommended Windows Installer

```powershell
# Run this command in PowerShell:
irm https://claude.ai/install.ps1 | iex
```

#### Option B: WinGet

```powershell
winget install Anthropic.ClaudeCode
```

#### Option C: NPM (Deprecated but works)

```powershell
npm install -g @anthropic-ai/claude-code
```

**Verify Installation:**
```powershell
claude --version
# Should output: 1.x.x
```

### 3. Get API Key

Claude Code requires an Anthropic API key.

1. **Sign up/Login:**
   - Visit: https://console.anthropic.com/
   - Create account or sign in

2. **Get API Key:**
   - Go to: https://console.anthropic.com/settings/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-...`)

3. **Save API Key:**
   ```powershell
   # Option 1: Environment variable (temporary)
   $env:ANTHROPIC_API_KEY="your-key-here"
   
   # Option 2: Claude Code will prompt on first run
   claude
   # Follow prompts to enter API key
   ```

### 4. First Run

Navigate to this repository and start Claude Code:

```powershell
# Navigate to your clone of this repository
cd "path\to\your\claude-code"

# Start Claude Code
claude
```

**On first run, you'll see:**
```
Welcome to Claude Code!

Enter your Anthropic API key: sk-ant-...

Select model:
1. Claude Sonnet 4.5 (Recommended)
2. Claude Opus 4
3. Claude Sonnet 4

> 1

Configuration saved! Starting Claude Code...
```

## Demonstrating Capabilities

Once Claude Code is running, try these examples:

### Example 1: Understanding This Repository

```
> What is this repository about?

> Show me what plugins are available

> Explain what the hookify plugin does

> List all the commands available in this repo
```

### Example 2: Exploring Plugins

```
> Show me how to use the /commit-push-pr command

> What does the feature-dev plugin do?

> How does the PR review toolkit work?

> Show me an example of using hookify
```

### Example 3: Code Analysis

```
> Analyze the structure of the plugins directory

> Find all Python files in this repository

> Show me examples of hook implementations

> What types of commands are available?
```

### Example 4: Creating Documentation

```
> Create a guide for using the hookify plugin

> Generate examples for the commit-commands plugin

> Explain how to create a custom plugin

> Document the security-guidance plugin
```

### Example 5: Using Commands (once plugins installed)

```
> /hookify Warn me when I use console.log

> /commit

> /feature-dev Add a new documentation page

> /pr-review-toolkit:review-pr all
```

## Plugin Demonstration Workflow

### Demo 1: Hookify Plugin

```
1. Explain hookify
> What does the hookify plugin do?

2. Show examples
> Show me examples from the hookify plugin

3. Create a rule
> /hookify Warn me when I use rm -rf commands

4. List rules
> /hookify:list

5. Test the rule
> Create a file that uses rm -rf
# Should see warning!
```

### Demo 2: Feature Development

```
1. Explore feature-dev
> Explain the feature-dev workflow

2. Show the phases
> What are the 7 phases in feature-dev?

3. Start a feature
> /feature-dev Add a new example file

4. Follow the workflow
# Claude guides through each phase
```

### Demo 3: Code Review

```
1. Understand PR review
> What does pr-review-toolkit do?

2. See the agents
> List the review agents in pr-review-toolkit

3. Review code
> /pr-review-toolkit:review-pr all

4. Specific aspect
> /pr-review-toolkit:review-pr tests
```

## Testing Each Plugin

### 1. Hookify
```powershell
# Test creating a rule
claude
> /hookify Warn about console.log usage
> /hookify:list
```

### 2. Commit Commands
```powershell
# Make a change
echo "# Test" > test.txt
git add test.txt

# Test commit
> /commit
```

### 3. Feature Dev
```powershell
> /feature-dev Add a hello world example
# Follow the guided workflow
```

### 4. PR Review Toolkit
```powershell
# If you have a PR
> /pr-review-toolkit:review-pr all
```

### 5. Plugin Dev
```powershell
> /plugin-dev:create-plugin
# Follow wizard to create a plugin
```

### 6. Code Review
```powershell
> /code-review
# Analyzes current changes
```

## Showcasing to Others

Create a demo script:

```powershell
# demo.ps1

# 1. Show repository structure
echo "=== Claude Code Plugin Repository ==="
tree /F plugins

# 2. Start Claude Code
echo "`n=== Starting Claude Code ===`n"
claude

# 3. In Claude Code, run:
# > What is this repository?
# > Show me all available plugins
# > Explain hookify with examples
# > /hookify Warn about dangerous commands
# > /hookify:list
# > Create a simple test file
# > /commit
```

## Recording a Demo

To record a demonstration:

1. **Use Windows Terminal with recording:**
   ```powershell
   # Install Windows Terminal if needed
   winget install Microsoft.WindowsTerminal
   ```

2. **Record with OBS Studio or similar**

3. **Demo script:**
   ```
   1. Show repository structure
   2. Start Claude Code
   3. Ask about the repository
   4. Demonstrate 2-3 plugins
   5. Show plugin installation
   6. Create a simple workflow
   ```

## Common Showcase Examples

### Example A: Safety with Hookify
```
> /hookify Don't let me commit files with passwords

> Create a config file with password="secret123"

> /commit
# See the hook stop the commit!
```

### Example B: Smart Commits
```
# Make several changes
> Add multiple features

> /commit
# Claude analyzes changes and creates smart commit message
```

### Example C: Feature Development
```
> /feature-dev Add user profile page

# Claude walks through:
# - Requirements gathering
# - Architecture design
# - Implementation
# - Testing
# - Review
```

### Example D: Code Quality
```
> /pr-review-toolkit:review-pr all

# Get detailed analysis:
# - Test coverage
# - Error handling
# - Type safety
# - Code quality
# - Simplification opportunities
```

## Troubleshooting Demo

If something doesn't work during demo:

### Node.js Issues
```powershell
# Verify Node.js
node --version
npm --version

# If not found, restart PowerShell after installation
```

### Claude Code Issues
```powershell
# Verify installation
claude --version

# Check API key
$env:ANTHROPIC_API_KEY

# Reinstall if needed
npm install -g @anthropic-ai/claude-code
```

### Plugin Issues
```powershell
# Check plugin structure
ls .claude/plugins/

# Restart Claude Code
exit
claude
```

## Next Steps After Demo

1. **Explore Documentation:**
   - [GETTING_STARTED.md](./docs/GETTING_STARTED.md)
   - [PLUGIN_GUIDE.md](./docs/PLUGIN_GUIDE.md)
   - [EXAMPLES.md](./docs/EXAMPLES.md)

2. **Try Building a Plugin:**
   ```
   > /plugin-dev:create-plugin
   ```

3. **Customize for Your Workflow:**
   - Create custom hooks with hookify
   - Set up your preferred commands
   - Configure security rules

4. **Share with Team:**
   - Show the plugins
   - Create team-specific rules
   - Build custom workflows

## Resources

- **Official Docs:** https://code.claude.com/docs
- **Discord Community:** https://anthropic.com/discord
- **GitHub Issues:** https://github.com/anthropics/claude-code/issues
- **This Repository:** Local plugins and examples

---

**Ready to demonstrate?** Install Node.js and Claude Code, then run `claude`!
