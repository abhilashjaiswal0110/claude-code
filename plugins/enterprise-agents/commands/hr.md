---
description: Execute the HR agent for policy guidance, benefits information, employee engagement insights, onboarding support, or exit interview analysis
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# HR Agent Command

Execute the HR agent to get policy guidance, benefits information, employee engagement insights, onboarding support, or exit interview analysis.

## Usage

```bash
/hr <query> [--mode <mode>] [--context <additional-context>]
```

## Modes

- `policy` - HR policy questions and guidance (default)
- `benefits` - Benefits package information and comparisons
- `engagement` - Employee engagement analysis and recommendations
- `onboarding` - Onboarding guide generation
- `exit-interview` - Exit interview summary and insights

## Examples

```bash
# Policy questions (auto-selects mode)
/hr What is the work from home policy?
/hr How do I request parental leave?

# Explicit mode selection
/hr --mode benefits Compare medical insurance plans
/hr --mode onboarding Create onboarding plan for Senior Engineer

# With additional context
/hr --mode policy --context "California employee, remote, has medical accommodation" What are my remote work rights?
```

## Implementation

When this command is invoked:

1. **Parse the input**
   - Extract query, mode, and context
   - If mode not specified, analyze query to determine most appropriate mode

2. **Mode determination heuristics**
   - Keywords "policy", "handbook", "rules" → `policy` mode
   - Keywords "benefits", "insurance", "401k", "PTO" → `benefits` mode
   - Keywords "engagement", "satisfaction", "morale" → `engagement` mode
   - Keywords "onboarding", "new hire", "first day" → `onboarding` mode
   - Keywords "exit", "leaving", "resignation", "offboarding" → `exit-interview` mode

3. **Execute the agent**
   ```typescript
   import { exec } from 'child_process';
   import { join } from 'path';

   const agentPath = join(process.cwd(), 'agents/hr-agent');
   const mode = determinedMode;
   const query = userQuery;
   const context = additionalContext || '';

   // Build command
   const cmd = `cd "${agentPath}" && npm start -- "${query}" --mode ${mode}${context ? ` --context "${context}"` : ''}`;

   // Execute with streaming output
   exec(cmd, (error, stdout, stderr) => {
     if (error) {
       logger.error(`HR Agent error: ${error.message}`);
       return;
     }
     logger.info(stdout);
   });
   ```

4. **Display results**
   - Show formatted output from agent
   - Provide link to generated JSON/markdown files
   - Offer follow-up actions:
     - "Generate employee-facing version?"
     - "Create workflow for this scenario?"
     - "Export to documentation?"

5. **Best practices reminder**
   - Include compliance disclaimer
   - Remind to verify policies with HR leadership
   - Suggest legal review for policy changes

## Output Format

The HR agent generates:
- **Console**: Formatted HR response with sections
- **JSON**: `agents/hr-agent/output/hr-{mode}-{timestamp}.json`
- **Markdown**: `agents/hr-agent/output/hr-{mode}-{timestamp}.md`

## Integration with Skills

This command leverages the **hr-expertise** skill for:
- Policy writing best practices
- Compliance considerations
- Employee communication tone
- Legal disclaimer templates

## Workflow Integration

Can be chained with:
- `/recruitment` - Generate onboarding after hiring
- `/learning` - Create learning paths for new roles
- `/it-ops` - IT resource provisioning for new hires

## Error Handling

- **Missing API key**: Prompt user to set `ANTHROPIC_API_KEY`
- **Agent not found**: Suggest running `npm install` in agent directory
- **Invalid mode**: Show available modes and suggest closest match
- **Empty query**: Prompt for specific question

## Security Considerations

- HR data is sensitive - never commit output files to git
- Add `.gitignore` rule: `agents/*/output/*.json`
- Remind users about data privacy policies
- Log queries for audit trail (optional, configurable)

## Teaching Notes (for Users)

**What you're learning:**
- How slash commands map to underlying CLI agents
- Mode-based agent invocation pattern
- Context passing for better results
- Output management and file organization

**Try experimenting with:**
- Different modes for the same query (compare results)
- Adding more context (see how it improves accuracy)
- Chaining with other commands (workflows)
