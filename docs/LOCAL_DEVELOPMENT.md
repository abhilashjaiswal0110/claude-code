# Local Development Setup

**Last Updated:** February 2026

This guide explains how to use this repository's local plugins with Claude Code CLI, either alongside or instead of the official marketplace.

## Table of Contents
- [Current Configuration](#current-configuration)
- [Managed Settings Location](#managed-settings-location)
- [How It Works](#how-it-works)
- [Restoring Official Pro Marketplace](#restoring-official-pro-marketplace)
- [Available Local Plugins](#available-local-plugins)
- [Testing Plugin Changes](#testing-plugin-changes)
- [Troubleshooting](#troubleshooting)

---

## Current Configuration

This repository includes a local plugin marketplace configuration. By default, the project's `.claude/settings.json` registers the local marketplace using `extraKnownMarketplaces`, which **adds** plugins alongside any official marketplace.

> **Note:** To completely block the official marketplace (enterprise scenario), you need a separate `managed-settings.json` file with `strictKnownMarketplaces`. This is typically controlled by system administrators and may not be editable by regular users.

### Configuration Files

| File | Purpose |
|------|---------|
| `~/.claude/managed-settings.json` | Blocks official marketplace via `strictKnownMarketplaces` |
| `~/.claude/settings.json` | Registers local marketplace via `extraKnownMarketplaces` |
| `.claude-plugin/marketplace.json` | Defines 13 local plugins |

### Key Settings

**`~/.claude/managed-settings.json`** (blocks official):
---

## How It Works

### extraKnownMarketplaces (Default - Additive)
```
extraKnownMarketplaces in .claude/settings.json:
- ADDS marketplaces to the available list
- Official marketplace remains available
- User can choose plugins from any source

Result: Both local-plugins AND official marketplace available
```

### strictKnownMarketplaces (Enterprise - Restrictive)
```
strictKnownMarketplaces in managed-settings.json:
- ONLY allows marketplaces explicitly listed
- Blocks claude-plugins-official if not listed
- Cannot be overridden by user settings (admin controlled)

Result: Only listed marketplaces are available
```

---

## Restoring Official Pro Marketplace

To restore the official Claude Code Pro marketplace:

### Option 1: Remove Managed Settings (Recommended)

```powershell
# Delete managed-settings.json to remove marketplace restriction
Remove-Item ~/.claude/managed-settings.json

# Restore official plugins in settings.json
# Edit ~/.claude/settings.json and add enabledPlugins:
```

```json
{
  "enabledPlugins": {
    "github@claude-plugins-official": true,
    "feature-dev@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true,
    "playwright@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true,
    "plugin-dev@claude-plugins-official": true
  },
  "extraKnownMarketplaces": {
    "local-plugins": {
      "source": {
        "source": "file",
        "path": ".claude-plugin/marketplace.json"
      }
    }
  },
  "autoUpdatesChannel": "latest",
  "model": "opus"
}
```

### Option 2: Keep Both Marketplaces (Enterprise)

If your organization uses `strictKnownMarketplaces`, request your admin to include both:

**`managed-settings.json`** (see [Managed Settings Location](#managed-settings-location)):
```json
{
  "strictKnownMarketplaces": {
    "local-plugins": {
      "source": {
        "source": "file",
        "path": "<path-to-repo>/.claude-plugin/marketplace.json"
      }
    },
    "claude-plugins-official": {
      "source": {
        "source": "github",
        "repo": "anthropics/claude-plugins-official"
      }
    }
  }
}
```

### Option 3: Official Only

To use ONLY the official marketplace (no local):

```powershell
# Delete managed-settings.json
Remove-Item ~/.claude/managed-settings.json

# Remove extraKnownMarketplaces from settings.json
# Keep only enabledPlugins for official plugins
```

---

## Available Local Plugins

The `local-plugins` marketplace contains 13 plugins:

| Plugin | Description | Category |
|--------|-------------|----------|
| **agent-sdk-dev** | Development kit for Claude Agent SDK | development |
| **claude-opus-4-5-migration** | Migrate code/prompts to Opus 4.5 | development |
| **code-review** | Automated PR code review with agents | productivity |
| **commit-commands** | Git commit workflow automation | productivity |
| **explanatory-output-style** | Educational insights about code | learning |
| **feature-dev** | 7-phase feature development workflow | development |
| **frontend-design** | Production-grade frontend interfaces | development |
| **hookify** | Create custom hooks via markdown rules | productivity |
| **learning-output-style** | Interactive learning mode | learning |
| **plugin-dev** | Plugin development toolkit | development |
| **pr-review-toolkit** | Comprehensive PR review agents | productivity |
| **ralph-wiggum** | Self-referential AI development loops | development |
| **security-guidance** | Security warnings for file edits | security |

---

## Testing Plugin Changes

1. **Edit plugin files** in `plugins/your-plugin/`
2. **Restart Claude Code** - changes are live immediately
3. **Test with** `/plugin list` to verify loading

---

## Troubleshooting

### Local Marketplace Not Showing

```powershell
# Verify managed-settings.json exists
cat ~/.claude/managed-settings.json

# Verify marketplace.json is valid
cat .claude-plugin/marketplace.json | ConvertFrom-Json

# Check for JSON syntax errors
```

### Official Marketplace Still Showing

The `strictKnownMarketplaces` setting in `managed-settings.json` must be correctly configured. Verify:
- File is at `~/.claude/managed-settings.json`
- JSON is valid (no trailing commas)
- Marketplace name matches exactly

### Plugins Not Loading

```powershell
# Verify plugin source paths are relative to marketplace.json
cat .claude-plugin/marketplace.json

# Each plugin should have: "source": "./plugins/plugin-name"
```

---

## File Structure

```
~/.claude/
├── managed-settings.json    # Blocks official marketplace
├── settings.json            # Registers local marketplace
└── settings.local.json      # Personal preferences (gitignored)

claude-code/
├── .claude-plugin/
│   └── marketplace.json     # 13 local plugin definitions
└── plugins/                 # Plugin source directories
    ├── hookify/
    ├── feature-dev/
    └── ...
```

---

**Questions?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or [CONTRIBUTING.md](../CONTRIBUTING.md)
