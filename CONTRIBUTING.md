# Contributing to Claude Code Plugins

Thank you for your interest in contributing to the official Claude Code plugins repository! This repository contains plugins that extend Claude Code's functionality with custom commands, specialized agents, hooks, and workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Creating a New Plugin](#creating-a-new-plugin)
- [Plugin Standards](#plugin-standards)
- [Testing Your Plugin](#testing-your-plugin)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Review Process](#code-review-process)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **Claude Code** - Installed globally on your system
3. **Anthropic API Key** - [Get from console.anthropic.com](https://console.anthropic.com/)
4. **Git** - For version control

### Setting Up Locally

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/claude-code.git
   cd claude-code
   ```

2. **Verify Claude Code installation:**
   ```bash
   claude --version
   ```

3. **Test existing plugins:**
   ```bash
   # Navigate to a test project
   cd /path/to/test-project

   # Start Claude Code
   claude

   # Reference this repository's marketplace
   > /plugin add marketplace /path/to/claude-code/.claude-plugin/marketplace.json
   ```

For detailed setup instructions with demos, see [docs/SETUP_DEMO.md](./docs/SETUP_DEMO.md).

## Repository Structure

```
claude-code/
├── .claude-plugin/
│   └── marketplace.json       # Plugin marketplace configuration
├── plugins/                   # All plugins
│   ├── plugin-name/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json   # Plugin metadata
│   │   ├── commands/         # Slash commands (optional)
│   │   ├── agents/           # Specialized agents (optional)
│   │   ├── skills/           # Agent Skills (optional)
│   │   ├── hooks/            # Event handlers (optional)
│   │   ├── .mcp.json         # MCP configuration (optional)
│   │   └── README.md         # Plugin documentation
│   └── README.md             # Plugins overview
├── docs/                     # Documentation
├── examples/                 # Example configurations
└── scripts/                  # Utility scripts
```

## Creating a New Plugin

### Using the Plugin Dev Plugin

The easiest way to create a new plugin is using the `plugin-dev` plugin:

```bash
claude

> /plugin-dev:create-plugin
# Follow the guided 8-phase workflow
```

### Manual Plugin Creation

1. **Create plugin directory:**
   ```bash
   mkdir -p plugins/your-plugin-name
   cd plugins/your-plugin-name
   ```

2. **Create plugin.json:**
   ```bash
   mkdir .claude-plugin
   ```

   Create `.claude-plugin/plugin.json`:
   ```json
   {
     "name": "your-plugin-name",
     "version": "1.0.0",
     "description": "Brief description of your plugin",
     "author": {
       "name": "Your Name",
       "email": "your.email@example.com"
     }
   }
   ```

3. **Create README.md:**
   Include:
   - Plugin description
   - Features
   - Installation instructions
   - Usage examples
   - Configuration options
   - Troubleshooting

4. **Add plugin components** (as needed):
   - Commands in `commands/`
   - Agents in `agents/`
   - Skills in `skills/`
   - Hooks in `hooks/`

5. **Register in marketplace:**
   Add your plugin to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "your-plugin-name",
     "description": "Brief description",
     "version": "1.0.0",
     "author": {
       "name": "Your Name",
       "email": "your.email@example.com"
     },
     "source": "./plugins/your-plugin-name",
     "category": "development"
   }
   ```

## Plugin Standards

### Plugin Metadata (plugin.json)

Required fields:
- `name` - Unique plugin identifier (kebab-case)
- `version` - Semantic version (e.g., "1.0.0")
- `description` - Clear, concise description

Optional fields:
- `author` - Author name and email
- `keywords` - Search keywords
- `category` - Plugin category

### README Requirements

Every plugin MUST include a comprehensive README.md with:

1. **Overview** - What the plugin does
2. **Features** - Key capabilities
3. **Installation** - How to install
4. **Usage** - Examples and commands
5. **Configuration** - Settings and options
6. **Examples** - Real-world usage
7. **Troubleshooting** - Common issues

### Code Quality

- Use clear, descriptive names
- Include inline comments for complex logic
- Follow existing patterns in the repository
- Keep files focused and modular
- Validate inputs and handle errors gracefully

### Documentation

- Write clear, concise markdown
- Include code examples
- Explain the "why" not just the "what"
- Keep documentation up to date with code changes

## Testing Your Plugin

### Local Testing

1. **Create a test project:**
   ```bash
   mkdir ~/test-plugin-project
   cd ~/test-plugin-project
   ```

2. **Configure Claude Code to use your plugin:**

   Create or edit `.claude/settings.json`:
   ```json
   {
     "plugins": {
       "marketplaces": [
         {
           "source": "/path/to/claude-code/.claude-plugin/marketplace.json"
         }
       ],
       "installed": ["your-plugin-name"]
     }
   }
   ```

3. **Test the plugin:**
   ```bash
   claude

   # Test commands
   > /your-command

   # Test agents
   > Use the your-agent agent to...

   # Test hooks (if applicable)
   # Perform actions that trigger the hooks
   ```

### Validation Checklist

Before submitting, verify:

- [ ] Plugin loads without errors
- [ ] All commands work as documented
- [ ] All agents execute successfully
- [ ] Hooks trigger at appropriate times
- [ ] README is complete and accurate
- [ ] Examples in README are tested
- [ ] No console errors or warnings
- [ ] Plugin works on intended platforms (Windows/macOS/Linux)

## Submitting a Pull Request

### Before You Submit

1. **Update documentation:**
   - Plugin README.md
   - Main README.md (if adding new plugin)
   - docs/ folder (if applicable)

2. **Test thoroughly:**
   - Test all commands and features
   - Verify on different platforms if possible
   - Check for edge cases

3. **Follow commit conventions:**
   ```bash
   git commit -m "feat(plugin-name): Add new feature"
   git commit -m "fix(plugin-name): Fix bug in command"
   git commit -m "docs(plugin-name): Update README"
   ```

   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation only
   - `refactor`: Code refactoring
   - `test`: Adding tests
   - `chore`: Maintenance

### Creating the Pull Request

1. **Push to your fork:**
   ```bash
   git push origin your-branch-name
   ```

2. **Open a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Description should include:**
   - What the plugin does
   - Why it's useful
   - How to test it
   - Screenshots or demo (if applicable)
   - Any breaking changes
   - Related issues

### PR Template

```markdown
## Description
[Brief description of the plugin or changes]

## Type of Change
- [ ] New plugin
- [ ] Bug fix
- [ ] Feature enhancement
- [ ] Documentation update
- [ ] Other (specify)

## Plugin Details
- **Plugin Name:**
- **Category:**
- **Main Features:**
  - Feature 1
  - Feature 2

## Testing
- [ ] Tested on Windows
- [ ] Tested on macOS
- [ ] Tested on Linux
- [ ] All commands work as documented
- [ ] All agents execute successfully
- [ ] README is complete

## Screenshots/Demo
[If applicable, add screenshots or demo GIFs]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested the plugin thoroughly
```

## Code Review Process

### What to Expect

1. **Initial Review** - A maintainer will review within 1-2 weeks
2. **Feedback** - You may receive requests for changes
3. **Iteration** - Make requested changes and push updates
4. **Approval** - Once approved, your PR will be merged

### Review Criteria

Reviewers will check:

- **Functionality** - Does it work as described?
- **Code Quality** - Is the code clean and maintainable?
- **Documentation** - Is it well documented?
- **Testing** - Has it been adequately tested?
- **Value** - Does it provide value to users?
- **Standards** - Does it follow plugin standards?

### Responding to Feedback

- Be responsive to reviewer comments
- Ask questions if feedback is unclear
- Make requested changes promptly
- Test changes before pushing updates
- Be open to suggestions and constructive criticism

## Plugin Categories

Choose the appropriate category for your plugin:

- **development** - Development tools and workflows
- **productivity** - Productivity enhancements
- **security** - Security and safety tools
- **learning** - Educational and learning aids
- **quality** - Code quality and review tools
- **automation** - Workflow automation
- **experimental** - Experimental features

## Best Practices

### Plugin Design

1. **Single Responsibility** - Each plugin should do one thing well
2. **Clear Purpose** - Users should immediately understand what it does
3. **Intuitive Commands** - Command names should be self-explanatory
4. **Good Defaults** - Work out of the box with sensible defaults
5. **Configurable** - Allow customization when needed

### User Experience

1. **Clear Feedback** - Provide clear success/error messages
2. **Helpful Errors** - Error messages should guide users to solutions
3. **Progress Indicators** - Show progress for long-running operations
4. **Examples** - Include practical, real-world examples
5. **Documentation** - Write docs for humans, not computers

### Performance

1. **Fast Loading** - Plugins should load quickly
2. **Efficient Execution** - Commands should execute promptly
3. **Resource Aware** - Don't consume excessive resources
4. **Async Operations** - Use async for long-running tasks
5. **Caching** - Cache when appropriate to improve performance

## Getting Help

### Resources

- **Documentation:** [docs/](./docs/) folder
- **Examples:** Check existing plugins for patterns
- **Plugin Dev:** Use the plugin-dev plugin for guidance
- **Discord:** [Claude Developers Discord](https://anthropic.com/discord)

### Questions?

- Open a GitHub Discussion for general questions
- Join the Discord community for real-time help
- Check existing issues for similar questions
- Tag maintainers in your PR for specific questions

## License

By contributing to this repository, you agree that your contributions will be licensed under the same license as the project (see [LICENSE.md](./LICENSE.md)).

## Thank You!

Thank you for contributing to Claude Code! Your plugins help make Claude Code more powerful and useful for everyone.

---

**Need help getting started?** Check out:
- [docs/SETUP_DEMO.md](./docs/SETUP_DEMO.md) - Setup walkthrough with demos
- [docs/PLUGIN_GUIDE.md](./docs/PLUGIN_GUIDE.md) - Plugin development guide
- [docs/EXAMPLES.md](./docs/EXAMPLES.md) - Usage examples
