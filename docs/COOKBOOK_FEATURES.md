# Cookbook-Inspired Features

This document describes the features and patterns implemented from [Anthropic's claude-cookbooks](https://github.com/anthropics/claude-cookbooks), providing enterprise-grade capabilities for autonomous agents and intelligent workflows.

## Overview

The following cookbook patterns have been ported and enhanced for enterprise use:

| Category | Feature | Package | Status |
|----------|---------|---------|--------|
| Core | Memory Tool System | `@enterprise-agents/core` | Production |
| Core | Extended Thinking | `@enterprise-agents/core` | Production |
| Core | Visualization Utilities | `@enterprise-agents/core` | Production |
| Agent | Research Agent | `agents/research-agent` | Production |
| Skills | Skills Framework | `@enterprise-agents/skills-framework` | Production |
| Orchestration | Orchestrator-Workers | `@enterprise-agents/orchestration` | Production |
| Orchestration | Evaluator-Optimizer | `@enterprise-agents/orchestration` | Production |
| Orchestration | Prompt Chaining | `@enterprise-agents/orchestration` | Production |
| Orchestration | Routing | `@enterprise-agents/orchestration` | Production |
| RAG | Knowledge Base | `@enterprise-agents/rag` | Production |
| RAG | RAG Engine | `@enterprise-agents/rag` | Production |

---

## 1. Memory Tool System

**Package:** `@enterprise-agents/core`
**Source:** [claude-cookbooks/tool_use/memory_tool.py](https://github.com/anthropics/claude-cookbooks/blob/main/tool_use/memory_tool.py)

### Description

The Memory Tool System provides persistent storage for agent state across sessions. It enables agents to remember context, store intermediate results, and maintain knowledge bases.

### Key Features

- **Path Validation**: Prevents directory traversal attacks
- **File Operations**: Create, read, update, delete memory files
- **String Replacement**: In-place text modifications
- **Security**: Confined to `/memories` directory

### Usage

```typescript
import { MemoryToolHandler, createMemoryTool } from '@enterprise-agents/core';

// Create handler
const memory = createMemoryTool('./agent-memory');

// Create a memory file
memory.execute({
  command: 'create',
  path: '/memories/session/notes.md',
  file_text: '# Session Notes\n\nKey findings...'
});

// View memory
const result = memory.execute({
  command: 'view',
  path: '/memories/session'
});

// Update memory
memory.execute({
  command: 'str_replace',
  path: '/memories/session/notes.md',
  old_str: 'Key findings',
  new_str: 'Important discoveries'
});
```

### Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `view` | View file/directory contents | `path`, `view_range` |
| `create` | Create or overwrite file | `path`, `file_text` |
| `str_replace` | Replace text in file | `path`, `old_str`, `new_str` |
| `insert` | Insert text at line | `path`, `insert_line`, `insert_text` |
| `delete` | Delete file or directory | `path` |
| `rename` | Rename/move file | `old_path`, `new_path` |

---

## 2. Extended Thinking

**Package:** `@enterprise-agents/core`
**Source:** [claude-cookbooks/extended_thinking](https://github.com/anthropics/claude-cookbooks/tree/main/extended_thinking)

### Description

Extended Thinking enables Claude to perform deeper reasoning by providing dedicated "thinking time" for complex problems before generating final responses.

### Key Features

- **Configurable Thinking Budget**: Control reasoning depth
- **Structured Analysis**: Pre-built analysis patterns
- **Problem Solving**: Systematic solution exploration
- **Code Review**: Deep code analysis

### Usage

```typescript
import {
  runExtendedThinking,
  runStructuredAnalysis,
  runProblemSolving,
  runCodeReview
} from '@enterprise-agents/core';

// Basic extended thinking
const result = await runExtendedThinking(
  'Analyze the trade-offs between microservices and monolithic architecture',
  {
    maxThinkingTokens: 5000,
    includeThinkingOutput: true
  }
);

// Structured analysis
const comparison = await runStructuredAnalysis(
  'Kubernetes vs Docker Swarm for enterprise',
  'comparison'
);

// Problem solving
const solution = await runProblemSolving(
  'How to reduce API latency by 50%',
  ['Must maintain backwards compatibility', 'Budget limited to $10k/month']
);

// Code review
const review = await runCodeReview(
  codeToReview,
  'typescript',
  ['security', 'performance']
);
```

### Analysis Types

| Type | Description |
|------|-------------|
| `comparison` | Compare multiple options with pros/cons |
| `evaluation` | Assess against criteria |
| `recommendation` | Provide actionable recommendations |
| `investigation` | Root cause analysis |
| `synthesis` | Integrate information from multiple sources |

---

## 3. Agent Visualization Utilities

**Package:** `@enterprise-agents/core`
**Source:** [claude-cookbooks/claude_agent_sdk/utils](https://github.com/anthropics/claude-cookbooks/tree/main/claude_agent_sdk/utils)

### Description

Shared utilities for consistent agent response visualization, activity tracking, and output formatting across all agents.

### Key Features

- **Activity Tracking**: Monitor agent operations
- **Response Parsing**: Structure raw outputs
- **Progress Display**: Terminal-friendly formatting
- **Token Usage**: Track consumption

### Usage

```typescript
import {
  resetActivityContext,
  printActivity,
  displayAgentResponse,
  formatTokenUsage,
  generateActivitySummary
} from '@enterprise-agents/core';

// Reset for new conversation
resetActivityContext();

// Track activity during execution
for await (const message of agentStream) {
  printActivity(message);
}

// Display formatted response
displayAgentResponse(messages, {
  showThinking: true,
  showToolCalls: true
});

// Show activity summary
console.log(generateActivitySummary());
```

---

## 4. Research Agent

**Package:** `agents/research-agent`
**Source:** [claude-cookbooks/claude_agent_sdk/research_agent](https://github.com/anthropics/claude-cookbooks/tree/main/claude_agent_sdk/research_agent)

### Description

Enterprise research agent with web search capabilities, automatic citation management, and multi-turn conversation support.

### Key Features

- **Multi-Stage Pipeline**: Source discovery, deep research, synthesis
- **Citation Management**: Automatic source tracking
- **Multiple Modes**: Comprehensive, quick-facts, comparison, etc.
- **Session Support**: Follow-up questions

### Usage

```bash
# CLI usage
npm start "What are the key trends in enterprise automation?"
npm start -- --mode=comparison "Kubernetes vs Docker Swarm"
```

```typescript
// Programmatic usage
import { conductResearch, createSession, continueResearch } from '@enterprise-agents/research-agent';

const result = await conductResearch({
  query: 'Enterprise automation trends 2026',
  researchType: 'comprehensive',
  context: 'Focus on manufacturing sector'
});

console.log(result.summary);
console.log(result.findings);
console.log(result.citations);

// Multi-turn session
const session = createSession(result);
const followUp = await continueResearch(session.id, 'What are the cost implications?');
```

### Research Modes

| Mode | Description | Best For |
|------|-------------|----------|
| `comprehensive` | Full multi-source research | In-depth analysis |
| `quick-facts` | Rapid factual lookup | Simple questions |
| `comparison` | Structured comparison | Evaluating options |
| `trend-analysis` | Pattern analysis | Strategic planning |
| `technical` | Deep technical research | Engineering decisions |
| `market` | Market dynamics | Business strategy |
| `literature` | Literature review | Research papers |

---

## 5. Skills Framework

**Package:** `@enterprise-agents/skills-framework`
**Source:** [claude-cookbooks/skills](https://github.com/anthropics/claude-cookbooks/tree/main/skills)

### Description

Progressive capability loading framework that enables custom skill development with token-efficient disclosure.

### Key Features

- **SKILL.md Format**: Standard skill definition
- **Progressive Disclosure**: Load only what's needed
- **Skill Registry**: Discovery and management
- **Skill Executor**: Execution with context

### Usage

```typescript
import {
  createSkillLoader,
  createSkillRegistry,
  createSkillExecutor,
  generateSkillTemplate
} from '@enterprise-agents/skills-framework';

// Load a skill
const loader = createSkillLoader();
const skill = await loader.loadSkill('./skills/financial-analyzer');

// Create registry
const registry = createSkillRegistry({
  customSkillsPath: './skills',
  autoDiscover: true
});

// Execute skill
const executor = createSkillExecutor();
const result = await executor.execute(skill, 'Analyze Q4 financials');

// Generate skill template
const template = generateSkillTemplate({
  name: 'my-skill',
  displayName: 'My Custom Skill',
  description: 'Does something useful',
  category: 'automation'
});
```

### SKILL.md Structure

```markdown
---
name: financial-analyzer
displayName: Financial Analyzer
description: Analyzes financial data and generates reports
version: 1.0.0
category: data-analysis
tags: [finance, reporting]
requiredTools: [Read, Write]
---

# Financial Analyzer

Description of what this skill does.

## Instructions

Detailed instructions for Claude...
```

---

## 6. Orchestration Patterns

**Package:** `@enterprise-agents/orchestration`
**Source:** [claude-cookbooks/patterns/agents](https://github.com/anthropics/claude-cookbooks/tree/main/patterns/agents)

### 6.1 Orchestrator-Workers

Decomposes complex tasks and delegates to specialized workers.

```typescript
import { Orchestrator, createEnterpriseOrchestrator } from '@enterprise-agents/orchestration';

const orchestrator = createEnterpriseOrchestrator();
const result = await orchestrator.execute(
  'Analyze our Q4 performance and create a presentation'
);

console.log(result.result);
console.log(result.state.results); // Individual worker results
```

### 6.2 Evaluator-Optimizer

Iteratively refines content through generation and evaluation cycles.

```typescript
import { createContentOptimizer, createCodeOptimizer } from '@enterprise-agents/orchestration';

// Content optimization
const contentOptimizer = createContentOptimizer();
const result = await contentOptimizer.optimize(
  'Write an executive summary of our Q4 results'
);

console.log(result.finalContent);
console.log(result.iterations); // See improvement over iterations

// Code optimization
const codeOptimizer = createCodeOptimizer();
const codeResult = await codeOptimizer.optimize(
  'Write a function to merge sorted arrays'
);
```

### 6.3 Prompt Chaining

Sequential execution with data flow between steps.

```typescript
import { createResearchWritingChain, PromptChain } from '@enterprise-agents/orchestration';

// Use pre-built chain
const chain = createResearchWritingChain();
const result = await chain.execute('The future of enterprise automation');

console.log(result.stepResults.research);
console.log(result.stepResults.outline);
console.log(result.finalOutput); // Final edited article

// Custom chain
const customChain = new PromptChain({
  steps: [
    { name: 'gather', promptTemplate: 'Gather data about {input}...', allowedTools: ['WebSearch'] },
    { name: 'analyze', promptTemplate: 'Analyze: {gather}...', allowedTools: [] },
    { name: 'report', promptTemplate: 'Create report from: {analyze}...', allowedTools: [] }
  ]
});
```

### 6.4 Routing

Dynamic input classification and handler selection.

```typescript
import { createTaskRouter, createCustomerServiceRouter, Router } from '@enterprise-agents/orchestration';

// Task routing
const taskRouter = createTaskRouter();
const result = await taskRouter.route('Help me fix a bug in my login code');

console.log(result.routeName); // 'coding'
console.log(result.output);

// Customer service routing
const csRouter = createCustomerServiceRouter();
const csResult = await csRouter.route('I was charged twice on my invoice');

console.log(csResult.routeName); // 'billing'
```

---

## 7. RAG (Retrieval-Augmented Generation)

**Package:** `@enterprise-agents/rag`
**Source:** [claude-cookbooks/capabilities/retrieval_augmented_generation](https://github.com/anthropics/claude-cookbooks/tree/main/capabilities/retrieval_augmented_generation)

### Description

Knowledge-enhanced generation with document management, chunking, and retrieval.

### Key Features

- **Knowledge Base**: Document storage and chunking
- **Multiple Chunking Strategies**: Fixed, sentence, paragraph, semantic
- **Text/Embedding Search**: Keyword and vector similarity
- **Context-Enhanced Generation**: RAG queries with Claude

### Usage

```typescript
import {
  createQuickRAG,
  createPersistentRAG,
  loadDocumentsFromDirectory
} from '@enterprise-agents/rag';

// Quick in-memory setup
const rag = createQuickRAG('company-docs');

// Add documents
await rag.getKnowledgeBase().addDocument({
  id: 'policy-1',
  content: 'Company policy content...',
  metadata: { title: 'HR Policy', type: 'policy' }
});

// Query with RAG
const result = await rag.query('What is the vacation policy?');
console.log(result.response);
console.log(result.sources);

// Persistent storage
const persistentRAG = createPersistentRAG('company-kb', './data/kb');

// Load from directory
const count = await loadDocumentsFromDirectory(
  persistentRAG.getKnowledgeBase(),
  './docs',
  ['.md', '.txt']
);
```

### Chunking Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| `fixed` | Fixed character size | Uniform documents |
| `sentence` | Sentence boundaries | Prose content |
| `paragraph` | Paragraph boundaries | Structured text |
| `semantic` | Header-based sections | Documentation |

---

## Architecture Considerations

### For Human Developers

1. **Package Selection**: Choose packages based on use case:
   - Core utilities: Always include `@enterprise-agents/core`
   - Complex workflows: Add `@enterprise-agents/orchestration`
   - Knowledge tasks: Add `@enterprise-agents/rag`
   - Custom capabilities: Use `@enterprise-agents/skills-framework`

2. **Pattern Selection**:
   - Simple task: Direct agent call
   - Multi-step task: Prompt chaining
   - Complex task: Orchestrator-workers
   - Quality-critical: Evaluator-optimizer
   - Input classification: Router

3. **Performance**:
   - Use memory tool for persistent state
   - Progressive disclosure for large skills
   - RAG chunking tuned to content type

### For Autonomous Agents

These packages are designed for agent-to-agent coordination:

1. **Self-Orchestration**: Agents can spawn sub-agents via orchestrator
2. **Self-Improvement**: Use evaluator-optimizer for iterative refinement
3. **Knowledge Access**: RAG provides grounded responses
4. **Skill Discovery**: Registry enables capability discovery
5. **State Persistence**: Memory tool enables cross-session continuity

---

## References

- [Anthropic Claude Cookbooks](https://github.com/anthropics/claude-cookbooks)
- [Building Effective Agents](https://anthropic.com/research/building-effective-agents)
- [Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Claude Agent SDK](https://docs.anthropic.com/en/api/claude-agent-sdk)

---

**Document Version:** 1.0.0
**Last Updated:** February 2026
**Maintainer:** Enterprise Platform Team
