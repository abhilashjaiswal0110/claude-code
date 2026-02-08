# Workflow Command

Execute predefined multi-agent workflows or create custom workflows by chaining enterprise agents.

## Usage

```bash
# Run predefined workflow
/workflow <workflow-name> <topic> [--context <details>]

# List available workflows
/workflow list

# Create custom workflow
/workflow custom --agents "marketing,presales,linkedin" <topic>

# Resume paused workflow
/workflow resume <workflow-id>
```

## Available Workflows

### `recruitment-pipeline`
**Purpose:** Complete hiring process (JD → screening → interview → offer → onboarding)

```bash
/workflow recruitment-pipeline "Senior Software Engineer"
```

**Agents:** Recruitment (×4 modes) → HR → IT-Ops → Learning
**Duration:** ~10-15 minutes
**Outputs:** 8 documents (JD, screening criteria, interview guide, offer, onboarding plan, IT setup, learning path, hiring rubric)

---

### `content-campaign`
**Purpose:** Multi-channel content launch (blog → social → sales enablement)

```bash
/workflow content-campaign "AI Platform Launch"
```

**Agents:** Marketing (×3 modes) → LinkedIn → Presales
**Duration:** ~8-12 minutes
**Outputs:** Blog, 3× LinkedIn posts, 5× tweets, pitch deck, newsletter section

---

### `hire-to-onboard`
**Purpose:** Accepted offer → productive team member

```bash
/workflow hire-to-onboard "Jane Doe - Senior Engineer"
```

**Agents:** Recruitment → HR → IT-Ops (×2 modes) → Learning
**Duration:** ~12-18 minutes
**Outputs:** Offer, 30-60-90 plan, IT provisioning list, training plan, runbooks, welcome announcement

---

### `proposal-development`
**Purpose:** Comprehensive RFP/proposal response

```bash
/workflow proposal-development "Healthcare EHR Migration RFP"
```

**Agents:** Presales (×2) → Cloud-Ops (×2) → Sustainability → Accessibility
**Duration:** ~15-20 minutes
**Outputs:** RFP response, technical architecture, cost analysis, sustainability section, compliance report, pitch deck, case studies

---

### `product-launch`
**Purpose:** Product/feature launch content package

```bash
/workflow product-launch "New API Gateway"
```

**Agents:** Marketing (×3) → Presales (×2) → HR → Learning
**Duration:** ~12-18 minutes
**Outputs:** Blog, press release, social content, sales deck, competitive positioning, internal guidelines, training materials

---

### `incident-postmortem`
**Purpose:** Post-incident analysis and prevention

```bash
/workflow incident-postmortem "Production DB Outage - Dec 5, 2026"
```

**Agents:** IT-Ops (×3) → Cloud-Ops → Learning → Sustainability (optional)
**Duration:** ~10-15 minutes
**Outputs:** Retrospective, architecture improvements, automation scripts, runbooks, training plan

---

### `accessibility-compliance`
**Purpose:** Accessibility audit → remediation → training

```bash
/workflow accessibility-compliance "Corporate Website WCAG 2.1 AA"
```

**Agents:** Accessibility (×4) → Cloud-Ops → Learning → Marketing
**Duration:** ~15-20 minutes
**Outputs:** Audit report, remediation plan, ARIA review, infrastructure changes, training materials, blog post

---

## Custom Workflows

Create ad-hoc workflows by specifying agents:

```bash
# Simple chain
/workflow custom --agents "marketing,linkedin,presales" "Cloud Security Best Practices"

# With mode specification
/workflow custom --agents "marketing:blog,presales:pitch-deck,hr:policy" "Remote Work Guidelines"

# Parallel execution (comma groups = sequential, semicolon = parallel)
/workflow custom --agents "marketing:blog;marketing:social;linkedin,presales:pitch-deck" "Topic"
# This runs marketing:blog, marketing:social, and linkedin in parallel, then presales:pitch-deck
```

## Implementation

When this command is invoked:

1. **Parse workflow request**
   - Identify workflow name or custom agent chain
   - Extract topic and context
   - Load workflow template or create from agents list

2. **Workflow execution engine**
   ```typescript
   interface Workflow {
     name: string;
     steps: WorkflowStep[];
     context: GlobalContext;
   }

   interface WorkflowStep {
     name: string;
     agent: string;
     mode?: string;
     dependsOn?: string[];  // IDs of steps that must complete first
     contextTransform?: (prev: any) => any;  // Transform previous outputs
     optional?: boolean;
   }

   async function executeWorkflow(workflow: Workflow, topic: string) {
     const state: WorkflowState = {
       workflowId: generateId(),
       status: 'running',
       steps: [],
       outputs: {},
       errors: []
     };

     // Display progress UI
     const progressUI = createProgressTracker(workflow.steps);

     for (const step of workflow.steps) {
       try {
         progressUI.updateStep(step.name, 'running');

         // Check dependencies
         if (step.dependsOn) {
           const allCompleted = step.dependsOn.every(
             dep => state.outputs[dep] !== undefined
           );
           if (!allCompleted) {
             throw new Error(`Dependencies not met: ${step.dependsOn.join(', ')}`);
           }
         }

         // Build context from previous outputs
         const stepContext = step.contextTransform
           ? step.contextTransform(state.outputs)
           : { topic, ...workflow.context };

         // Execute agent
         const output = await executeAgent(
           step.agent,
           step.mode,
           stepContext
         );

         // Store output
         state.outputs[step.name] = output;
         progressUI.updateStep(step.name, 'completed');

       } catch (error) {
         if (step.optional) {
           logger.warn(`Optional step "${step.name}" failed, continuing...`);
           progressUI.updateStep(step.name, 'skipped');
         } else {
           state.errors.push(error.message);
           await handleWorkflowError(error, step, state);
           break;
         }
       }
     }

     return state;
   }
   ```

3. **Progress visualization**
   ```
   Workflow: Recruitment Pipeline
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✅ Job Description                    (45s) ─┬─ Completed
   ✅ Screening Criteria                 (32s) ─┤
   ✅ Interview Questions                (38s) ─┤
   ⏳ Offer Letter                       (25s) ─┤ In Progress
   ⏸️  Onboarding Plan                         ─┤ Pending
   ⏸️  IT Provisioning                         ─┤
   ⏸️  Learning Path                           ─┘

   Time elapsed: 2m 20s | Estimated remaining: 3m 40s
   ```

4. **Output aggregation**
   - Collect all agent outputs
   - Generate summary document
   - Create zip file with all artifacts
   - Save workflow metadata

5. **Post-workflow actions**
   - Display summary of generated assets
   - Offer to export to specific formats
   - Suggest related workflows
   - Ask for feedback on workflow

## Workflow State Management

### Checkpointing
Save state after each step:
```json
{
  "workflowId": "wf-abc123",
  "checkpointStep": 4,
  "outputs": {
    "step1": "...",
    "step2": "...",
    "step3": "..."
  }
}
```

### Resume from Checkpoint
```bash
/workflow resume wf-abc123

# Resumes from step 4, reusing outputs from steps 1-3
```

### Pausing
```bash
/workflow pause wf-abc123

# Workflow pauses after current step completes
# Can resume later with /workflow resume
```

## Error Handling

### Step Failure
```
❌ Step 4 (Offer Letter) failed: Invalid context

Error: Missing candidate name and compensation details

Options:
[1] Provide missing information and retry
[2] Skip this step (not recommended)
[3] Edit workflow and resume from step 3
[4] Cancel entire workflow
[5] Save progress and exit

Your choice [1-5]:
```

### Timeout Handling
```
⏱️  Step 3 (Interview Questions) taking longer than expected...

Elapsed: 5m 30s | Typical: 3m 00s

This step is still running. You can:
[1] Continue waiting
[2] Extend timeout by 5 minutes
[3] Cancel this step and skip
[4] Pause workflow

Your choice [1-4]:
```

## Workflow Customization

### Skip Steps
```bash
/workflow recruitment-pipeline "Engineer" --skip "screening,interview"
# Only generates: JD, offer, onboarding, IT, learning
```

### Override Modes
```bash
/workflow content-campaign "Topic" --marketing-mode newsletter --presales-mode competitor
```

### Inject Custom Context
```bash
/workflow hire-to-onboard "Jane Doe" \
  --hr-context "Remote, Seattle, starts March 1" \
  --it-ops-context "MacBook Pro, AWS access, Figma license" \
  --learning-context "Senior level, focus on leadership skills"
```

## Workflow Templates API

Users can define custom workflow templates in `.claude/enterprise-agents/workflows/`:

```yaml
# my-workflow.yaml
name: "technical-blog-series"
description: "Create a 3-part blog series with sales follow-up"
agents:
  - name: "Research"
    agent: "marketing"
    mode: "blog"
    context:
      prompt: "Research {{topic}} - Part 1: Fundamentals"

  - name: "Part 1"
    agent: "marketing"
    mode: "blog"
    dependsOn: ["Research"]
    context:
      prompt: "Write Part 1: {{topic}} fundamentals"
      useResearch: "{{Research.researchSummary}}"

  - name: "Part 2"
    agent: "marketing"
    mode: "blog"
    context:
      prompt: "Write Part 2: {{topic}} advanced concepts"

  - name: "Part 3"
    agent: "marketing"
    mode: "blog"
    context:
      prompt: "Write Part 3: {{topic}} real-world applications"

  - name: "Sales Enablement"
    agent: "presales"
    mode: "pitch-deck"
    dependsOn: ["Part 1", "Part 2", "Part 3"]
    context:
      prompt: "Create pitch deck based on blog series about {{topic}}"

outputs:
  format: "zip"
  filename: "blog-series-{{topic}}-{{date}}.zip"
  manifest: true
```

Use custom workflow:
```bash
/workflow technical-blog-series "Kubernetes Security"
```

## Performance Optimization

### Parallel Execution
Detect independent steps and run in parallel:
```typescript
// Sequential: 3 × 4min = 12min
Step1 (MarketingStep2 (Presales) → Step3 (HR)

// Parallel: max(4min, 3min, 5min) = 5min
Step1 (Marketing) ⎤
Step2 (Presales)  ⎥ → Step4 (Summary)
Step3 (HR)        ⎦
```

### Caching
Cache agent outputs for 1 hour:
```bash
/workflow content-campaign "Cloud Security"  # Fresh run

# 30 minutes later, same topic
/workflow content-campaign "Cloud Security"  # Uses cached outputs (instant)

# Different topic
/workflow content-campaign "AI Ethics"  # Fresh run
```

### Streaming
Display partial results as they complete:
```
✅ [Blog]
   Title: "The Future of Cloud Security"
   Preview: "As enterprises move to cloud..."
   📄 View full output

⏳ [Social Posts] Generating... (30s)
```

## Teaching Notes

**Key concepts:**
- **Workflow orchestration**: Coordinating multiple agents
- **State management**: Tracking progress across steps
- **Error recovery**: Handling failures gracefully
- **Context passing**: Sharing information between agents

**Architectural insight:**

This workflow engine implements several enterprise patterns:
1. **Saga pattern** - Distributed transaction with compensation
2. **Pipeline pattern** - Data flows through stages
3. **Observer pattern** - Progress monitoring
4. **State machine** - Workflow state transitions

**Why not just run commands manually?**

Manual approach:
```bash
/marketing "Topic"  # Wait 3min, copy output
/presales "Pitch about {{paste output}}"  # Wait 3min, copy output
/linkedin "Post about {{paste output}}"  # Wait 2min
```

Workflow approach:
```bash
/workflow content-campaign "Topic"  # Wait 8min, all done
```

Benefits:
- ✅ Context automatically passed
- ✅ Progress tracked
- ✅ Can pause and resume
- ✅ All outputs organized
- ✅ Reproducible (same workflow, consistent results)
