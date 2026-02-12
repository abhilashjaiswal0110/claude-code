# Claude Code

![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square) [![npm](https://img.shields.io/npm/v/@anthropic-ai/claude-code.svg?style=flat-square)](https://www.npmjs.com/package/@anthropic-ai/claude-code)

An agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows—all through natural language commands.

**Official Documentation:** [code.claude.com/docs](https://code.claude.com/docs/en/overview)

<img src="./demo.gif" alt="Claude Code Demo" />

## Quick Start

```bash
# Install (macOS/Linux)
curl -fsSL https://claude.ai/install.sh | bash

# Install (Windows)
irm https://claude.ai/install.ps1 | iex

# Navigate to your project and run
cd your-project && claude
```

> [!NOTE]
> Installation via npm is deprecated. For more installation options, see the [setup documentation](https://code.claude.com/docs/en/setup).

## Features

- 🔌 **13+ Official Plugins** - Extend functionality with custom commands, agents, and workflows
- 🏢 **Enterprise AI Agents** - Pre-built agents for HR, IT Ops, Marketing, Recruitment, Presales, and L&D
- 🤖 **AI-Powered Assistance** - Natural language commands for code understanding and generation
- 🔧 **Git Workflow Integration** - Smart commits, PR creation, and automated code review
- 📝 **Custom Hooks & Rules** - Define behavior patterns and prevent unwanted actions
- 🎯 **Specialized Agents** - Feature development, security guidance, plugin creation, and more

## Plugins

This repository contains production-ready plugins for Claude Code:

| Plugin | Description |
|--------|-------------|
| **[Hookify](./plugins/hookify/)** | Create custom rules to prevent unwanted behaviors |
| **[Feature Dev](./plugins/feature-dev/)** | Structured 7-phase feature development workflow |
| **[Commit Commands](./plugins/commit-commands/)** | Smart git workflows with AI-powered commits |
| **[PR Review Toolkit](./plugins/pr-review-toolkit/)** | Comprehensive PR reviews with 6 specialized agents |
| **[Code Review](./plugins/code-review/)** | Automated review with confidence-based scoring |
| **[Plugin Dev](./plugins/plugin-dev/)** | Build and test your own Claude Code plugins |
| **[Agent SDK Dev](./plugins/agent-sdk-dev/)** | Development tools for Claude Agent SDK |
| **[Frontend Design](./plugins/frontend-design/)** | Production-grade UI design guidance |
| **[Security Guidance](./plugins/security-guidance/)** | Automatic security warnings and best practices |

See the complete [Plugin Guide](./docs/PLUGIN_GUIDE.md) for all 13 plugins and detailed documentation.

## Enterprise AI Agents

This repository includes production-ready AI agents built with the Claude Agent SDK for enterprise use cases:

| Agent | Description | Modes |
|-------|-------------|-------|
| **[HR Agent](./agents/hr-agent/)** | Employee relations, policy guidance, and onboarding support | `policy`, `onboarding`, `performance`, `employee-relations` |
| **[IT Operations Agent](./agents/it-operations-agent/)** | Infrastructure management, incident response, and automation | `incident`, `monitoring`, `automation`, `documentation` |
| **[Marketing Agent](./agents/marketing-agent/)** | Content generation for enterprise marketing | `blog`, `social`, `campaign`, `press-release`, `newsletter` |
| **[Recruitment Agent](./agents/recruitment-agent/)** | Hiring support with bias detection | `jd`, `screening`, `interview`, `comparison`, `offer` |
| **[Presales Agent](./agents/presales-agent/)** | Proposal generation and competitive analysis | `proposal`, `competitor`, `rfp`, `pitch-deck`, `win-loss` |
| **[Learning & Development Agent](./agents/learning-dev-agent/)** | Training and skill development planning | `skill-gap`, `learning-path`, `training`, `assessment` |
| **[LinkedIn Content Generator](./agents/linkedin-content-generator/)** | Professional LinkedIn content creation | Research-based content generation |
| **[Sustainability Agent](./agents/sustainability-agent/)** | IT sustainability, carbon footprint, and ESG compliance | `carbon-footprint`, `green-it`, `sustainability-report`, `energy-optimization`, `esg-compliance` |
| **[Accessibility Agent](./agents/accessibility-agent/)** | Digital accessibility auditing and WCAG compliance | `wcag-audit`, `remediation-plan`, `alt-text`, `aria-review`, `compliance-report` |
| **[Cloud Operations Agent](./agents/cloud-ops-agent/)** | Multi-cloud operations, FinOps, and SRE practices | `cost-optimization`, `incident-response`, `capacity-planning`, `architecture-review`, `migration-assessment` |

### Shared Packages

- **[@enterprise-agents/core](./packages/agent-core/)** - Shared SDK utilities: pipeline execution, CLI parsing, logging
- **[@enterprise-agents/prompts](./packages/agent-prompts/)** - Reusable prompt fragments and enterprise context

### Quick Start (Enterprise Agents)

```bash
# Navigate to an agent directory
cd agents/marketing-agent

# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the agent
npm start "Your Topic Here"
```

For detailed documentation, see individual agent README files.

## Documentation

**📚 Full Documentation:** [docs/README.md](./docs/README.md)

Quick Links:
- **[Getting Started](./docs/GETTING_STARTED.md)** - Installation, setup, and first steps
- **[Setup Demo](./docs/SETUP_DEMO.md)** - Hands-on walkthrough with examples
- **[Plugin Guide](./docs/PLUGIN_GUIDE.md)** - Complete reference for all plugins
- **[Examples](./docs/EXAMPLES.md)** - Real-world usage examples and workflows
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Plugin development guidelines
- Code standards and best practices
- Pull request process
- Testing and validation

## Community & Support

- **Discord:** [Claude Developers Discord](https://anthropic.com/discord)
- **Bug Reports:** Use `/bug` command in Claude Code or [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- **Discussions:** [GitHub Discussions](https://github.com/anthropics/claude-code/discussions)

## Data & Privacy

When you use Claude Code, we collect feedback including usage data, conversation data, and user-submitted feedback via the `/bug` command.

- **Data Usage:** See our [data usage policies](https://code.claude.com/docs/en/data-usage)
- **Privacy:** Limited retention periods, restricted access, no model training on user data
- **Legal:** [Commercial Terms](https://www.anthropic.com/legal/commercial-terms) | [Privacy Policy](https://www.anthropic.com/legal/privacy)

## License

See [LICENSE.md](./LICENSE.md) for details.

---

**Ready to get started?** Follow the [Getting Started guide](./docs/GETTING_STARTED.md) or jump straight to the [examples](./docs/EXAMPLES.md).
