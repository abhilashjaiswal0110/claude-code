# Local Development Setup

**Last Updated:** February 2026

This guide explains how to use this repository's local plugins with Claude Code CLI, with the official marketplace disabled.

## Table of Contents
- [Current Configuration](#current-configuration)
- [How It Works](#how-it-works)
- [Restoring Official Pro Marketplace](#restoring-official-pro-marketplace)
- [Available Local Plugins](#available-local-plugins)
- [Testing Plugin Changes](#testing-plugin-changes)
- [Troubleshooting](#troubleshooting)

---

## Current Configuration

This setup uses `strictKnownMarketplaces` to **block the official marketplace** and only allow local plugins.

### Configuration Files

| File | Purpose |
|------|---------|
| `~/.claude/managed-settings.json` | Blocks official marketplace via `strictKnownMarketplaces` |
| `~/.claude/settings.json` | Registers local marketplace via `extraKnownMarketplaces` |
| `.claude-plugin/marketplace.json` | Defines 13 local plugins |

### Key Settings

**`~/.claude/managed-settings.json`** (blocks official):
```json
{
  "strictKnownMarketplaces": {
    "local-plugins": {
      "source": {
        "source": "file",
        "path": "C:/Users/a833555/OneDrive - ATOS/Gitwork/claude-code/.claude-plugin/marketplace.json"
      }
    }
  }
}
```

**`~/.claude/settings.json`** (registers local):
```json
{
  "extraKnownMarketplaces": {
    "local-plugins": {
      "source": {
        "source": "file",
        "path": "C:/Users/a833555/OneDrive - ATOS/Gitwork/claude-code/.claude-plugin/marketplace.json"
      }
    }
  }
}
```

---

## How It Works

```
strictKnownMarketplaces in managed-settings.json:
- ONLY allows marketplaces explicitly listed
- Blocks claude-plugins-official (not listed)
- Cannot be overridden by user settings

Result: Only local-plugins marketplace is available
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
        "path": "C:/Users/a833555/OneDrive - ATOS/Gitwork/claude-code/.claude-plugin/marketplace.json"
      }
    }
  },
  "autoUpdatesChannel": "latest",
  "model": "opus"
}
```

### Option 2: Keep Both Marketplaces

To have BOTH local and official marketplaces:

**`~/.claude/managed-settings.json`:**
```json
{
  "strictKnownMarketplaces": {
    "local-plugins": {
      "source": {
        "source": "file",
        "path": "C:/Users/a833555/OneDrive - ATOS/Gitwork/claude-code/.claude-plugin/marketplace.json"
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
