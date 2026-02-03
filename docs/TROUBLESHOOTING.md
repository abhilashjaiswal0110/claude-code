# Troubleshooting Claude Code

**Last Updated:** February 2026

Common issues and their solutions when working with Claude Code and its plugins.

## Table of Contents

1. [Installation Issues](#installation-issues) - Node.js, Claude Code installation, command not found
2. [API & Authentication](#api--authentication) - API keys, rate limiting, authentication errors
3. [Plugin Problems](#plugin-problems) - Plugin loading, commands not found, path issues
4. [Command Issues](#command-issues) - Slash commands, argument parsing
5. [Performance Issues](#performance-issues) - Slow startup, high token usage, response time
6. [Hook Problems](#hook-problems) - Hooks not triggering, Hookify rules, errors
7. [Platform-Specific Issues](#platform-specific-issues) - Windows, macOS, Linux issues
8. [Getting More Help](#getting-more-help) - Logs, debug mode, bug reports, community
9. [Common Error Messages](#common-error-messages) - Tool execution, context window, model availability
10. [Preventive Measures](#preventive-measures) - Best practices

---

## Installation Issues

### Node.js Not Found

**Problem:**
```
node: The term 'node' is not recognized...
```

**Solution:**
```powershell
# Windows: Download and install from nodejs.org
# Verify installation:
node --version
npm --version

# If installed but not in PATH:
# Add to PATH: C:\Program Files\nodejs\

# Or use nvm:
# Download from: https://github.com/coreybutler/nvm-windows
nvm install 18
nvm use 18
```

**macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 18
nvm use 18

# Verify
node --version
```

### Claude Code Installation Fails

**Problem:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solution:**
```bash
# Option 1: Use recommended installer (not npm)
# Windows:
irm https://claude.ai/install.ps1 | iex

# macOS/Linux:
curl -fsSL https://claude.ai/install.sh | bash

# Option 2: Fix npm permissions
# macOS/Linux:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Option 3: Use nvm (recommended)
# Install via nvm to avoid permission issues
```

### Claude Command Not Found

**Problem:**
```
claude: The term 'claude' is not recognized...
```

**Solution:**
```bash
# Verify installation
npm list -g @anthropic-ai/claude-code

# If installed but not in PATH:
# Find installation location:
npm root -g

# Add to PATH (Windows PowerShell):
$env:PATH += ";$env:APPDATA\npm"

# Add to PATH (macOS/Linux):
export PATH="$PATH:$(npm root -g)/.bin"

# Reinstall if needed:
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

---

## API & Authentication

### API Key Not Set

**Problem:**
```
Error: ANTHROPIC_API_KEY not found
```

**Solution:**
```bash
# Set environment variable
# Windows PowerShell:
$env:ANTHROPIC_API_KEY="your-key-here"

# Windows CMD:
set ANTHROPIC_API_KEY=your-key-here

# macOS/Linux:
export ANTHROPIC_API_KEY="your-key-here"

# Or add to config file
claude config set apiKey your-key-here

# Or run setup again
claude setup
```

### API Rate Limiting

**Problem:**
```
Error: Rate limit exceeded
```

**Solution:**
```bash
# Wait a few minutes, then try again

# Or upgrade your API plan at:
# https://console.anthropic.com/

# Check your usage:
# https://console.anthropic.com/settings/usage

# Use a different model (if available):
claude config set model claude-sonnet-4
```

### Authentication Errors

**Problem:**
```
Error: Invalid API key
```

**Solution:**
```bash
# Verify your API key is correct
# Get new key from: https://console.anthropic.com/

# Reset configuration
claude config reset

# Run setup again
claude setup

# Manually set key
claude config set apiKey your-correct-key-here
```

---

## Plugin Problems

### Plugin Not Loading

**Problem:**
Installed plugin not appearing or commands not working.

**Solution:**
```bash
# 1. Check plugin is installed
ls .claude/plugins/

# 2. Verify plugin structure
ls .claude/plugins/plugin-name/.claude-plugin/
cat .claude/plugins/plugin-name/.claude-plugin/plugin.json

# 3. Check for syntax errors in plugin.json
# Use online JSON validator if needed

# 4. Restart Claude Code
exit
claude

# 5. Check plugin logs
cat .claude/logs/plugins.log
```

### Plugin Commands Not Found

**Problem:**
```
Unknown command: /my-command
```

**Solution:**
```bash
# 1. List available commands
/help

# 2. Check command file exists
ls .claude/plugins/plugin-name/commands/

# 3. Verify command filename matches
# Command file should be: command-name.md
# Command invocation: /command-name

# 4. Check command file format
cat .claude/plugins/plugin-name/commands/command-name.md

# Should start with:
# # Command Name
# Description...
```

### Plugin Installation Path Issues

**Problem:**
Plugin copied but not working.

**Solution:**
```bash
# Correct structure:
your-project/
└── .claude/
    └── plugins/
        └── plugin-name/
            ├── .claude-plugin/
            │   └── plugin.json
            ├── commands/
            ├── agents/
            └── README.md

# Common mistakes:
# ❌ .claude/plugin-name/ (missing plugins/)
# ❌ .claude/plugins/plugins/plugin-name/ (extra plugins/)
# ❌ plugins/plugin-name/ (should be in .claude/)

# Fix:
mv plugins/plugin-name .claude/plugins/plugin-name
```

---

## Command Issues

### Slash Commands Not Working

**Problem:**
Typing `/command` shows as plain text.

**Solution:**
```bash
# 1. Make sure you're in Claude Code (not regular terminal)
# You should see: >

# 2. Commands must start with /
# Correct: /commit
# Wrong: commit

# 3. Check command is available
/help

# 4. Some commands need plugins installed
# Example: /hookify requires hookify plugin

# 5. Restart if commands just installed
exit
claude
```

### Command Arguments Not Parsed

**Problem:**
```
/command argument1 argument2
# Not parsed correctly
```

**Solution:**
```bash
# Use quotes for multi-word arguments
/commit "Add new feature"

# Some commands use flags
/pr-review-toolkit:review-pr --aspect=tests

# Check command help
/help command-name

# Or check plugin documentation
cat .claude/plugins/plugin-name/commands/command-name.md
```

---

## Performance Issues

### Claude Code Slow to Start

**Problem:**
Takes a long time to initialize.

**Solution:**
```bash
# 1. Check network connection (API calls required)

# 2. Large codebase? Exclude irrelevant files
# Create .claudeignore file:
echo "node_modules/" >> .claudeignore
echo "build/" >> .claudeignore
echo "dist/" >> .claudeignore
echo ".git/" >> .claudeignore

# 3. Clear cache
rm -rf .claude/cache/

# 4. Use faster model (if available)
claude config set model claude-sonnet-4
```

### High Token Usage

**Problem:**
Using too many tokens/API calls.

**Solution:**
```bash
# 1. Be specific in prompts
# ❌ "Fix everything"
# ✅ "Fix the login function in auth.ts"

# 2. Use .claudeignore to exclude large files
# node_modules, build outputs, etc.

# 3. Break large tasks into smaller steps

# 4. Monitor usage at:
# https://console.anthropic.com/settings/usage
```

### Responses Taking Too Long

**Problem:**
Claude taking a long time to respond.

**Solution:**
```bash
# 1. Check internet connection

# 2. Simplify the prompt
# Instead of: "Review entire codebase and fix all issues"
# Try: "Review auth.ts for security issues"

# 3. Use specific commands instead of general questions
# /commit instead of "create a commit message for these changes"

# 4. Check API status
# https://status.anthropic.com/
```

---

## Hook Problems

### Hooks Not Triggering

**Problem:**
Custom hooks not executing.

**Solution:**
```bash
# 1. Check hooks.json exists and is valid
cat .claude/plugins/plugin-name/hooks/hooks.json

# Should be valid JSON:
{
  "PreToolUse": ["pretooluse.py"],
  "PostToolUse": ["posttooluse.py"]
}

# 2. Check hook handler file exists
ls .claude/plugins/plugin-name/hooks/

# 3. Verify file permissions (Unix/Mac)
chmod +x .claude/plugins/plugin-name/hooks/*.py
chmod +x .claude/plugins/plugin-name/hooks/*.sh

# 4. Check for syntax errors
python .claude/plugins/plugin-name/hooks/pretooluse.py
# Should not error

# 5. Check hook logs
cat .claude/logs/hooks.log
```

### Hookify Rules Not Working

**Problem:**
Created rule but not triggering.

**Solution:**
```bash
# 1. List rules to verify it exists
> /hookify:list

# 2. Check rule file
cat .claude/hookify.rule-name.local.md

# 3. Verify YAML frontmatter is valid
# Must have:
# ---
# action: warn|stop|allow
# match_type: tool_use|message
# pattern: regex_pattern
# ---

# 4. Test pattern separately
# Python regex: https://regex101.com/

# 5. Check rule is enabled
> /hookify:configure

# 6. Rules require exact YAML format
# Spaces matter! Use spaces, not tabs
```

### Hook Returns Error

**Problem:**
```
Hook error: [error message]
```

**Solution:**
```bash
# 1. Check handler script for syntax errors
python -m py_compile .claude/plugins/plugin-name/hooks/handler.py

# 2. Check handler returns correct format
# Must return dict with 'action' key:
return {'action': 'allow'}
return {'action': 'warn', 'message': 'Warning text'}
return {'action': 'stop', 'message': 'Stop text'}

# 3. Check Python dependencies installed
pip install -r requirements.txt

# 4. View detailed error in logs
cat .claude/logs/hooks.log
```

---

## Platform-Specific Issues

### Windows Issues

#### PowerShell Execution Policy

**Problem:**
```
cannot be loaded because running scripts is disabled
```

**Solution:**
```powershell
# Check current policy
Get-ExecutionPolicy

# Set to RemoteSigned (recommended)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run specific script
PowerShell -ExecutionPolicy Bypass -File script.ps1
```

#### Path with Spaces

**Problem:**
Paths with spaces not working.

**Solution:**
```powershell
# Use quotes
cd "C:\Users\My Name\project"

# Or escape spaces
cd C:\Users\My` Name\project

# For Claude commands, always use quotes:
> "C:\Program Files\myapp\file.txt"
```

### macOS/Linux Issues

#### Permission Denied

**Problem:**
```
Permission denied: .claude/plugins/hook.sh
```

**Solution:**
```bash
# Make hook executable
chmod +x .claude/plugins/plugin-name/hooks/*.sh
chmod +x .claude/plugins/plugin-name/hooks/*.py

# If still fails, check ownership
ls -la .claude/plugins/

# Fix ownership
chown -R $(whoami) .claude/plugins/
```

#### Shell Not Found

**Problem:**
```
/bin/sh: command not found
```

**Solution:**
```bash
# Install missing command
# Ubuntu/Debian:
sudo apt-get install command-name

# macOS:
brew install command-name

# Or modify hook to use available shell
# Change #!/bin/sh to #!/bin/bash
```

---

## Getting More Help

### Check Logs

```bash
# Main log
cat .claude/logs/main.log

# Plugin logs
cat .claude/logs/plugins.log

# Hook logs
cat .claude/logs/hooks.log

# Recent errors
tail -f .claude/logs/main.log
```

### Debug Mode

```bash
# Start Claude Code in debug mode
claude --debug

# Or set environment variable
# Windows:
$env:CLAUDE_DEBUG="true"
claude

# macOS/Linux:
CLAUDE_DEBUG=true claude
```

### Report Bugs

```bash
# Within Claude Code
> /bug

# Or file GitHub issue:
# https://github.com/anthropics/claude-code/issues

# Include:
# - Claude Code version (claude --version)
# - Operating system
# - Node.js version (node --version)
# - Error message
# - Steps to reproduce
```

### Community Help

- **Discord:** https://anthropic.com/discord
- **GitHub Issues:** https://github.com/anthropics/claude-code/issues
- **Documentation:** https://code.claude.com/docs

---

## Common Error Messages

### "Tool execution failed"

**Cause:** Hook blocked the operation or tool error.

**Solution:**
```bash
# Check hook logs
cat .claude/logs/hooks.log

# Temporarily disable hooks
> /hookify:configure disable-all

# Try operation again
```

### "Context window exceeded"

**Cause:** Too much code/context loaded.

**Solution:**
```bash
# Be more specific in requests
# Use .claudeignore to exclude files
# Break task into smaller pieces
```

### "Model not available"

**Cause:** Selected model not accessible with your API key.

**Solution:**
```bash
# Use default model
claude config set model claude-sonnet-4

# Check your API plan includes model
# https://console.anthropic.com/
```

### "Workspace not initialized"

**Cause:** Not in Claude Code session.

**Solution:**
```bash
# Navigate to project
cd your-project

# Start Claude Code
claude

# Should see > prompt
```

---

## Preventive Measures

### Best Practices

1. **Keep Updated:**
```bash
# Update Claude Code regularly
npm update -g @anthropic-ai/claude-code

# Or use installer
irm https://claude.ai/install.ps1 | iex
```

2. **Use .claudeignore:**
```bash
# Exclude unnecessary files
cat > .claudeignore << EOF
node_modules/
.git/
build/
dist/
*.log
EOF
```

3. **Regular Cleanup:**
```bash
# Clear cache periodically
rm -rf .claude/cache/

# Clean old logs
rm .claude/logs/*.log.old
```

4. **Backup Configurations:**
```bash
# Save your settings
cp .claude/settings.json .claude/settings.json.backup

# Backup custom plugins
tar -czf plugins-backup.tar.gz .claude/plugins/
```

---

**Still having issues?** Join the Discord community or file a GitHub issue!
