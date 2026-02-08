# Enterprise Agents Plugin

**Unified access to 10 production-ready enterprise AI agents with intelligent automation and workflow orchestration.**

## Overview

This plugin brings all enterprise agents into Claude Code with:
- ✨ **Auto-invocation** - Agents automatically trigger when you need them
- 🔗 **Workflow chaining** - Combine multiple agents for complex tasks
- 🎯 **Mode selection** - Interactive mode picker for each agent
- 📊 **Rich output** - Formatted results with JSON export
- 🧠 **Domain expertise** - Built-in skills for enterprise scenarios

## Available Agents

| Command | Agent | Modes |
|---------|-------|-------|
| `/hr` | HR Agent | policy, benefits, engagement, onboarding, exit-interview |
| `/marketing` | Marketing Agent | blog, social, campaign, press-release, newsletter |
| `/recruitment` | Recruitment Agent | jd, screening, interview, comparison, offer |
| `/presales` | Presales Agent | proposal, competitor, rfp, pitch-deck, win-loss |
| `/it-ops` | IT Operations Agent | incident, monitoring, automation, documentation |
| `/learning` | L&D Agent | skill-gap, learning-path, training, assessment |
| `/linkedin` | LinkedIn Content | (auto-mode) |
| `/sustainability` | Sustainability Agent | carbon-footprint, green-it, sustainability-report, energy-optimization, esg-compliance |
| `/accessibility` | Accessibility Agent | wcag-audit, remediation-plan, alt-text, aria-review, compliance-report |
| `/cloud-ops` | Cloud Ops Agent | cost-optimization, incident-response, capacity-planning, architecture-review, migration-assessment |

## Quick Start

### Manual Invocation

```bash
# Basic usage - agent will prompt for mode
> /hr What is the PTO policy?

# Specify mode directly
> /marketing --mode social Create a post about our new AI platform

# With additional context
> /recruitment --mode jd --context "Senior Engineer, 5+ years exp, AI/ML focus"
```

### Auto-Invocation (Automatic!)

Just describe what you need - the plugin detects intent:

```bash
# Automatically triggers HR agent
> Help me understand our benefits package

# Automatically triggers Marketing agent
> Write a blog post about cloud migration

# Automatically triggers Recruitment agent
> Create a job description for a DevOps engineer
```

### Workflow Chaining

Combine agents for complex scenarios:

```bash
# Recruitment pipeline - JD to onboarding
> /workflow recruitment-pipeline "Senior Data Scientist"

# Content marketing campaign
> /workflow content-campaign "AI-powered customer analytics"

# Incident postmortem analysis
> /workflow incident-postmortem "Production outage report"
```

## Auto-Invocation Patterns

The plugin automatically detects when you need an agent:

| Trigger Phrases | Agent | Mode |
|----------------|-------|------|
| "job description", "JD", "hiring for" | Recruitment | jd |
| "blog post", "article", "write about" | Marketing | blog |
| "policy", "benefits", "PTO", "HR question" | HR | policy |
| "LinkedIn post", "professional content" | LinkedIn | auto |
| "carbon footprint", "sustainability", "green IT" | Sustainability | varies |
| "WCAG", "accessibility audit", "a11y" | Accessibility | varies |
| "cloud costs", "AWS optimization", "FinOps" | Cloud Ops | varies |

## Skills Included

This plugin provides domain expertise through skills:

- **HR Expertise** - Policy writing, benefits design, employee relations
- **Marketing Expertise** - Content strategy, messaging, brand voice
- **Recruitment Expertise** - Bias-free JDs, screening criteria, interview guides
- **IT Operations** - Incident response, SRE practices, automation
- **Sustainability** - ESG compliance, carbon accounting, green IT
- **Accessibility** - WCAG standards, remediation, inclusive design
- **Workflow Orchestration** - Multi-agent coordination, context passing

## Architecture

```
/hr "PTO policy"
  ↓
[Command Executor]
  ↓
[Mode Detection/Selection]
  ↓
[Agent Invocation] → agents/hr-agent/
  ↓
[Output Formatting]
  ↓
[Display + JSON Export]
```

## Output Format

Each agent generates:
1. **Console output** - Formatted, human-readable
2. **JSON file** - Machine-readable data in `/agents/{agent}/output/`
3. **Markdown summary** - Executive summary with metadata

## Configuration

Add to your `.claude/settings.json`:

```json
{
  "plugins": {
    "installed": ["enterprise-agents"]
  },
  "enterprise-agents": {
    "autoInvoke": true,
    "defaultModes": {
      "hr": "policy",
      "marketing": "blog"
    },
    "workflowChaining": true,
    "outputDirectory": "./output/enterprise-agents"
  }
}
```

## Workflows

### Built-in Workflow Templates

1. **Recruitment Pipeline**
   ```bash
   /workflow recruitment-pipeline "Software Engineer"
   ```
   JD Creation → Screening Criteria → Interview Guide → Offer Letter

2. **Content Marketing Campaign**
   ```bash
   /workflow content-campaign "Product Launch"
   ```
   Research → Blog → Social Posts → Press Release → Newsletter

3. **Onboarding Journey**
   ```bash
   /workflow new-hire-onboarding "John Doe, Senior Developer"
   ```
   HR Onboarding → IT Setup → Learning Path → 30-day Plan

4. **Sustainability Assessment**
   ```bash
   /workflow sustainability-audit "Data Center Operations"
   ```
   Carbon Footprint → Green IT Recommendations → ESG Report

## Best Practices

1. **Be specific with context** - More context = better results
   ```bash
   # Good
   /hr What is the remote work policy for employees in California with medical accommodations?

   # Less specific
   /hr remote work
   ```

2. **Use workflows for related tasks** - Don't run agents in isolation
   ```bash
   # Better
   /workflow recruitment-pipeline "DevOps Engineer"

   # Manual approach
   /recruitment --mode jd
   /recruitment --mode screening
   /recruitment --mode interview
   ```

3. **Leverage auto-invoke for discovery** - Let the system guide you
   ```bash
   # Natural language works!
   > I need to create content for our AI platform launch
   [Plugin detects → Marketing agent → Suggests campaign mode]
   ```

## Development

### Adding New Agents

1. Create agent in `/agents/your-agent/`
2. Add command file to `/plugins/enterprise-agents/commands/your-agent.md`
3. Create skill in `/plugins/enterprise-agents/skills/your-agent-expertise/`
4. Update auto-invoke patterns in `/plugins/enterprise-agents/hooks/auto-invoke-agent.py`

### Testing

```bash
cd plugins/enterprise-agents
npm test

# Test specific agent
npm test -- --agent=hr

# Test workflow
npm test -- --workflow=recruitment-pipeline
```

## Troubleshooting

### Agent Not Found

```bash
# Verify agent is installed
ls agents/hr-agent

# Check plugin is loaded
claude plugin list
```

### Output Not Generated

```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Verify output directory exists
ls agents/hr-agent/output/
```

### Auto-invoke Not Working

Check `.claude/settings.json`:
```json
{
  "enterprise-agents": {
    "autoInvoke": true  // Must be true
  }
}
```

## Learn More

- **Agent Documentation**: `/agents/README.md`
- **Core Package**: `/packages/agent-core/`
- **Prompt Library**: `/packages/agent-prompts/`

## Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Contact: abhilash.jaiswal@example.com

---

**Ready to get started?** Try: `/hr What is the PTO policy?`
