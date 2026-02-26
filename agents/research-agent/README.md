# Research Agent

Enterprise research agent with web search, citations, and multi-turn conversation support. Inspired by Anthropic's claude-cookbooks patterns.

## Features

- **Multi-stage Research Pipeline**: Source discovery, deep research, and synthesis
- **Automatic Citation Management**: All factual claims are properly cited
- **Multiple Research Modes**: comprehensive, quick-facts, comparison, trend-analysis, technical, market, literature
- **Session Support**: Continue research with follow-up questions
- **Extended Thinking**: Optional deep reasoning for complex research

## Usage

### CLI

```bash
# Basic usage (comprehensive mode)
npm start "What are the key trends in enterprise automation?"

# With specific mode
npm start -- --mode=quick-facts "What is the current market cap of Microsoft?"
npm start -- --mode=comparison "Kubernetes vs Docker Swarm for enterprise"
npm start -- --mode=technical "How does WebSocket protocol work?"
```

### Programmatic

```typescript
import { conductResearch, createSession, continueResearch } from '@enterprise-agents/research-agent';

// Single research query
const result = await conductResearch({
  query: 'Enterprise automation trends 2026',
  researchType: 'comprehensive',
  context: 'Focus on manufacturing sector',
});

console.log(result.summary);
console.log(result.findings);
console.log(result.citations);

// Multi-turn research session
const session = createSession(result);

const followUp = await continueResearch(
  session.id,
  'What are the cost implications?'
);
```

## Research Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `comprehensive` | Full multi-source research with synthesis | In-depth analysis |
| `quick-facts` | Rapid factual lookup | Simple questions |
| `comparison` | Structured comparison analysis | Evaluating options |
| `trend-analysis` | Pattern and future projection analysis | Strategic planning |
| `technical` | Deep technical research | Engineering decisions |
| `market` | Market dynamics and competition | Business strategy |
| `literature` | Academic literature review | Research papers |

## Output

Research results are saved to `output/` directory:
- `*.txt` - Formatted research report
- `*.json` - Structured data for programmatic use

## Configuration

Copy `.env.example` to `.env` and set your API key:

```bash
cp .env.example .env
```

## Architecture

```
research-agent/
├── src/
│   ├── index.ts      # Main agent logic
│   ├── persona.ts    # Agent persona configuration
│   ├── prompts.ts    # Stage and mode prompts
│   └── types.ts      # TypeScript interfaces
├── output/           # Generated research reports
├── package.json
└── tsconfig.json
```

## Citation Format

All research outputs follow strict citation standards:
- Inline citations: `[Source Title](URL)`
- Reference list with numbered entries
- Credibility assessments when available

## Related

- [Anthropic Claude Cookbooks](https://github.com/anthropics/claude-cookbooks)
- [Enterprise Agent Core](../packages/agent-core)
