# Local Development Setup

**Last Updated:** February 2026

This guide explains how to use this repository's local plugins with Claude Code CLI.

## Configuration Overview

This repository uses two configuration files:

### `.claude/settings.json` (Project-specific)
- **Purpose:** Configure this repository to use LOCAL plugins from `plugins/` directory
- **Committed to git:** Yes
- **Contains:** Plugin marketplace references and installed plugins list
- **Schema:** Must use `https://json.schemastore.org/claude-code-settings.json`
- **Usage:** When you run `claude` in this repo, it uses these local plugins

### `.claude/settings.local.json` (User-specific)
- **Purpose:** Your personal settings (PRO subscription, permissions, etc.)
- **Committed to git:** No (ignored)
- **Contains:** User permissions, personal preferences
- **Usage:** Persists across all your Claude Code sessions

## How It Works

```
When you run: claude

Claude Code loads:
1. .claude/settings.json       → Uses LOCAL plugins from this repo
2. .claude/settings.local.json → Your PRO subscription settings
3. Both coexist without conflict!
```

## Verify Local Setup

### Check Plugin Source
```bash
cd /path/to/this/repo
claude

# Inside Claude Code:
> /plugin list
```

You should see plugins from this repository's `plugins/` directory.

### Switch Between Local and PRO

**Use Local Plugins (this repo):**
```bash
cd /path/to/claude-code-repo
claude
# Uses .claude/settings.json → LOCAL plugins
```

**Use PRO Subscription (other projects):**
```bash
cd /path/to/your-other-project
claude
# Uses global PRO settings → PRO plugins
```

## Current Configuration

### Installed Local Plugins
The following plugins from this repository are installed:

1. **hookify** - Custom hooks and rules
2. **feature-dev** - 7-phase feature development
3. **commit-commands** - Git workflow automation
4. **pr-review-toolkit** - Comprehensive PR reviews
5. **code-review** - Automated code review
6. **plugin-dev** - Plugin development toolkit
7. **agent-sdk-dev** - Agent SDK development
8. **frontend-design** - Frontend UI design
9. **security-guidance** - Security warnings

### Available Local Plugins
See [.claude-plugin/marketplace.json](./.claude-plugin/marketplace.json) for all 13 available plugins.

## Adding More Plugins

Edit `.claude/settings.json` and add to the `installed` array:

```json
{
  "plugins": {
    "installed": [
      "hookify",
      "your-new-plugin-name"
    ]
  }
}
```

Then restart Claude Code:
```bash
claude
```

## Testing Plugin Changes

When developing plugins:

1. **Make changes** to plugin files in `plugins/your-plugin/`
2. **Restart Claude Code** - it will reload from local files
3. **Test your changes** immediately
4. **No need to reinstall** - changes are live!

## Troubleshooting

### Plugins Not Loading
```bash
# Check settings file exists
cat .claude/settings.json

# Verify marketplace path is correct
cat .claude-plugin/marketplace.json
```

### Using Wrong Plugins
```bash
# Verify you're in the repository directory
pwd

# Check which settings file is active
cat .claude/settings.json
```

### PRO Subscription Not Working
Your PRO subscription settings are in `.claude/settings.local.json` which is preserved and not modified by this setup.

## File Structure

```
claude-code/
├── .claude/
│   ├── settings.json           # Project: use LOCAL plugins
│   ├── settings.local.json     # User: PRO subscription (gitignored)
│   └── commands/               # Custom commands
│
├── .claude-plugin/
│   └── marketplace.json        # Plugin registry
│
└── plugins/                    # 13 local plugins
    ├── hookify/
    ├── feature-dev/
    └── ...
```

## Key Points

✅ **Local and PRO coexist** - No conflicts
✅ **Project-specific** - Only affects this repository
✅ **Instant updates** - Plugin changes apply immediately
✅ **PRO preserved** - Your subscription settings untouched
✅ **Git-friendly** - settings.json committed, settings.local.json ignored

## Next Steps

1. **Start Claude Code:** `claude` (in this repo directory)
2. **List plugins:** `/plugin list`
3. **Try a plugin:** `/hookify Create a rule to warn about console.log`
4. **Develop plugins:** Edit files in `plugins/` and restart

---

**Questions?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or [CONTRIBUTING.md](../CONTRIBUTING.md)
