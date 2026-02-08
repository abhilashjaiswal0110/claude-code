# Enterprise Agents Plugin - Installation & Testing Guide

## Prerequisites

1. **Claude Code** installed and configured
2. **Enterprise agents** in `/agents` directory
3. **Shared packages** in `/packages` (@enterprise-agents/core and @enterprise-agents/prompts)
4. **Python 3.7+** (for hooks)
5. **ANTHROPIC_API_KEY** environment variable set

## Installation

### Option 1: Copy Plugin to Project

```bash
# From the claude-code repository root
cp -r plugins/enterprise-agents /path/to/your-project/.claude/plugins/

# Make hooks executable
chmod +x /path/to/your-project/.claude/plugins/enterprise-agents/hooks/*.py
```

### Option 2: Global Installation

```bash
# Link plugin globally (accessible in all projects)
ln -s $(pwd)/plugins/enterprise-agents ~/.claude/plugins/enterprise-agents

# Make hooks executable
chmod +x ~/.claude/plugins/enterprise-agents/hooks/*.py
```

### Option 3: Configure Marketplace

Add to your `.claude/settings.json`:

```json
{
  "plugins": {
    "marketplaces": [
      {
        "source": "/path/to/claude-code/.claude-plugin/marketplace.json"
      }
    ],
    "installed": ["enterprise-agents"]
  },
  "enterprise-agents": {
    "autoInvoke": true,
    "workflowChaining": true,
    "outputDirectory": "./output/enterprise-agents"
  }
}
```

## Verification

### 1. Start Claude Code

```bash
cd /path/to/your-project
claude
```

You should see the Enterprise Agents welcome banner:

```
╔═══════════════════════════════════════════════════════════════╗
║           🏢 Enterprise Agents Plugin Loaded                  ║
╠═══════════════════════════════════════════════════════════════╣
║  10 AI agents available: /hr, /marketing, /recruitment, etc.  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 2. List Available Commands

```bash
> /help
```

Look for:
- `/hr`
- `/marketing`
- `/recruitment`
- `/presales`
- `/it-ops`
- `/learning`
- `/linkedin`
- `/sustainability`
- `/accessibility`
- `/cloud-ops`
- `/workflow`

### 3. Verify Agent Integration

Check agents are accessible:

```bash
# From claude-code root
ls agents/hr-agent/src/index.ts
ls agents/marketing-agent/src/index.ts
```

Verify agents can run:

```bash
cd agents/hr-agent
npm install  # If not already installed
npm start -- "What is the PTO policy?" --mode policy
```

## Testing

### Test 1: Basic Command Invocation

```bash
> /hr What is the work from home policy?
```

**Expected:**
- Command executes
- HR agent runs in `policy` mode
- Output displayed in console
- Files generated in `agents/hr-agent/output/`

### Test 2: Mode Selection

```bash
> /marketing --mode social Create a post about cloud security
```

**Expected:**
- Marketing agent runs in `social` mode
- Social media content generated
- Output formatted for LinkedIn/Twitter

### Test 3: Auto-Invocation

```bash
> Help me write a job description for a Senior Engineer
```

**Expected:**
- Auto-detection hook triggers
- Suggestion appears:
  ```
  💡 Auto-detection: This looks like a job for the RECRUITMENT agent!
  Would you like me to invoke: /recruitment "Senior Engineer"
  ```

### Test 4: Workflow Execution

```bash
> /workflow recruitment-pipeline "DevOps Engineer"
```

**Expected:**
- Workflow starts
- Progress tracker displays
- Multiple agents execute sequentially
- All outputs saved to respective agent directories
- Summary displayed at end

### Test 5: Skill Invocation

Create a test scenario that triggers skill usage:

```bash
> I'm writing an HR policy about remote work. What should I include?
```

**Expected:**
- HR expertise skill is referenced
- Claude provides guidance on policy structure, compliance, clarity
- Follows framework from HR expertise skill

## Troubleshooting

### Plugin Not Loading

**Symptom:** Welcome banner doesn't appear

**Solutions:**
1. Check plugin path:
   ```bash
   ls .claude/plugins/enterprise-agents/.claude-plugin/plugin.json
   ```

2. Verify plugin.json syntax:
   ```bash
   cat .claude/plugins/enterprise-agents/.claude-plugin/plugin.json | python -m json.tool
   ```

3. Check Claude Code logs:
   ```bash
   claude --verbose
   ```

### Commands Not Found

**Symptom:** `/hr` command not recognized

**Solutions:**
1. Verify command files exist:
   ```bash
   ls .claude/plugins/enterprise-agents/commands/hr.md
   ```

2. Restart Claude Code:
   ```bash
   exit
   claude
   ```

3. Check for typos in command files

### Agent Execution Fails

**Symptom:** `/hr` runs but agent errors

**Solutions:**
1. Verify ANTHROPIC_API_KEY is set:
   ```bash
   echo $ANTHROPIC_API_KEY
   ```

2. Check agent installation:
   ```bash
   cd agents/hr-agent
   npm install
   npm start -- "test" --mode policy
   ```

3. Review agent logs in output directory

### Hooks Not Triggering

**Symptom:** No auto-detection suggestions

**Solutions:**
1. Verify hooks are executable:
   ```bash
   ls -la .claude/plugins/enterprise-agents/hooks/
   ```

2. Make hooks executable:
   ```bash
   chmod +x .claude/plugins/enterprise-agents/hooks/*.py
   ```

3. Test hook manually:
   ```bash
   echo '{"prompt": "help me write a job description"}' | python .claude/plugins/enterprise-agents/hooks/auto-invoke-agent.py
   ```

4. Check Python version:
   ```bash
   python --version  # Should be 3.7+
   ```

### Workflow Hangs

**Symptom:** Workflow starts but never completes

**Solutions:**
1. Check for agent timeout:
   - Default timeout is 5 minutes per agent
   - Long-running agents may need extended timeout

2. Verify all agents in workflow exist:
   ```bash
   ls agents/  # Check all agents are present
   ```

3. Check workflow logs for errors

## Configuration

### Custom Settings

Create `.claude/enterprise-agents/config.json`:

```json
{
  "agents": {
    "defaultModes": {
      "hr": "policy",
      "marketing": "blog",
      "recruitment": "jd"
    },
    "timeouts": {
      "default": 300,
      "marketing": 600,
      "presales": 600
    }
  },
  "autoInvoke": {
    "enabled": true,
    "confidenceThreshold": 0.8,
    "showSuggestions": true
  },
  "workflows": {
    "parallel": true,
    "saveCheckpoints": true,
    "autoResume": false
  },
  "output": {
    "directory": "./output/enterprise-agents",
    "format": "both",  // "json", "markdown", or "both"
    "compression": false
  }
}
```

### Brand Voice Customization

Create `.claude/enterprise-agents/brand-voice.json`:

```json
{
  "company": "Your Company",
  "industry": "Your Industry",
  "tone": ["professional", "innovative", "trustworthy"],
  "avoid": ["hype", "buzzwords", "jargon"],
  "keywords": ["key term 1", "key term 2"],
  "compliance": {
    "requireLegal": ["pricing", "guarantees"],
    "disclaimers": ["Legal disclaimer text..."]
  }
}
```

### Custom Workflow Templates

Create `.claude/enterprise-agents/workflows/my-workflow.yaml`:

```yaml
name: "custom-workflow"
description: "Your workflow description"
agents:
  - name: "Step 1"
    agent: "marketing"
    mode: "blog"
    context:
      prompt: "{{topic}}"

  - name: "Step 2"
    agent: "presales"
    mode: "pitch-deck"
    dependsOn: ["Step 1"]
    context:
      prompt: "Create deck about {{topic}}"
```

## Performance Optimization

### Caching

Enable output caching (1 hour TTL):

```json
{
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "directory": "./cache/enterprise-agents"
  }
}
```

### Parallel Execution

Workflows automatically detect parallel steps. To force sequential:

```json
{
  "workflows": {
    "parallel": false
  }
}
```

## Security Considerations

### API Key Management

**Never commit API keys:**

```bash
# Add to .gitignore
echo "agents/*/.env" >> .gitignore
echo "agents/*/output" >> .gitignore
```

### Output Files

**Sensitive data warning:**

```bash
# HR agent outputs may contain PII
# Ensure output directories are in .gitignore
echo "output/enterprise-agents/" >> .gitignore
```

### Hook Security

**Hooks run with filesystem access:**
- Review hook code before installation
- Hooks are sandboxed by Claude Code
- Don't modify hooks without understanding

## Next Steps

### 1. Create Your First Agent Command

Try generating content:
```bash
> /marketing Create a blog about AI ethics
```

### 2. Test a Workflow

Run a complete workflow:
```bash
> /workflow content-campaign "Your Product Launch"
```

### 3. Customize for Your Org

Add your brand voice, compliance requirements, and custom workflows.

### 4. Train Your Team

Share the plugin with your team and create internal documentation.

## Advanced Usage

### Chaining Commands

```bash
> /recruitment --mode jd "Senior Engineer"
# Review output, then:
> /recruitment --mode screening --context "5+ years, distributed systems" "Senior Engineer"
> /recruitment --mode interview --context "Technical depth + leadership" "Senior Engineer"
```

### Custom Context Passing

```bash
> /marketing --mode blog --context "Target: CTOs, Tone: Technical, Length: 2000 words" "Kubernetes Security"
```

### Resume Paused Workflows

```bash
> /workflow recruitment-pipeline "Engineer"
# Workflow pauses or fails at step 4
> /workflow resume wf-abc123
# Resumes from checkpoint
```

## Support

### Getting Help

1. **Documentation**: `/plugins/enterprise-agents/README.md`
2. **Command help**: `/help <command>`
3. **Skill reference**: Check `skills/*/SKILL.md` files
4. **GitHub Issues**: Report bugs or request features

### Contributing

See `CONTRIBUTING.md` for:
- Adding new agent commands
- Creating custom skills
- Developing workflows
- Testing guidelines

## Appendix: File Structure

```
enterprise-agents/
├── .claude-plugin/
│   └── plugin.json                    # Plugin metadata
├── commands/                           # Slash commands
│   ├── hr.md
│   ├── marketing.md
│   ├── recruitment.md
│   ├── presales.md
│   ├── it-ops.md
│   ├── learning.md
│   ├── linkedin.md
│   ├── sustainability.md
│   ├── accessibility.md
│   ├── cloud-ops.md
│   └── workflow.md
├── skills/                             # Domain expertise
│   ├── hr-expertise/
│   │   └── SKILL.md
│   ├── marketing-expertise/
│   │   └── SKILL.md
│   ├── recruitment-expertise/
│   │   └── SKILL.md
│   └── workflow-orchestration/
│       └── SKILL.md
├── hooks/                              # Event handlers
│   ├── hooks.json
│   ├── session-start.py
│   └── auto-invoke-agent.py
└── README.md                          # Plugin documentation
```

## Testing Checklist

- [ ] Plugin loads on Claude Code start
- [ ] Welcome banner displays
- [ ] All 10 agent commands are available
- [ ] `/workflow list` shows predefined workflows
- [ ] Auto-invocation suggests correct agent
- [ ] Basic agent execution works (`/hr "test"`)
- [ ] Mode selection works (`/marketing --mode social "test"`)
- [ ] Workflow execution completes successfully
- [ ] Output files are generated in agent directories
- [ ] Hooks are executable and functioning
- [ ] Skills are accessible (check Claude responses)
- [ ] Custom configuration is loaded correctly

## Known Limitations

1. **Agent Execution**: Commands shell out to agent CLI - requires agents to be installed and working
2. **Parallel Workflows**: Currently sequential by default (parallel execution in roadmap)
3. **Resumption**: Workflow resume requires checkpoint files (auto-saved)
4. **Windows Support**: Hook scripts may need adjustment for Windows (use `.cmd` or PowerShell)
5. **Rate Limits**: Multiple agent calls may hit Anthropic API rate limits

## Roadmap

### Planned Features
- [ ] True parallel workflow execution (multi-threading)
- [ ] Web UI for workflow visualization
- [ ] Agent output diffing/comparison
- [ ] Workflow analytics dashboard
- [ ] MCP server integration
- [ ] Custom agent registration API
- [ ] Template marketplace

---

**Need help?** Open an issue or check the documentation in `/plugins/enterprise-agents/README.md`
