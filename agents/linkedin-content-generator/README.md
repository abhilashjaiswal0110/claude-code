# LinkedIn Content Generator Agent

An AI-powered agent that generates copy-ready LinkedIn posts in **Abhilash Jaiswal's voice**, built with the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview).

## What It Does

Give it a topic. It produces **two complete, copy-paste ready LinkedIn posts** — no templates, no fill-in-the-blanks. Each post is written in Abhilash's actual voice: approachable, practitioner-led, technically grounded.

**Post 1 — Analytical/Insight-led:** Bold opening, numbered framework, thought-provoking closing question.

**Post 2 — Story/Experience-led:** Personal moment or experiment, narrative build to the insight, conversational and human.

## Two Ways to Use

### 1. Web UI (Recommended)

Run the full stack from the project root:

```bash
# From the monorepo root
npm run dev
```

Then open http://localhost:5173, select **LinkedIn Generator** from the agents list.

**Make sure `packages/api-server/.env` has your API key set:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Modes available in the web UI:**
- **Research + Draft** — Analyses the topic, suggests angles, provides 3 draft opening hooks and a hashtag strategy
- **Generate Posts** — Writes two complete copy-ready LinkedIn posts directly

### 2. CLI (Standalone)

```bash
cd agents/linkedin-content-generator

# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...

# Generate posts for a topic
npm start "Your topic here"
```

## Output Example

For **Generate Posts** mode, output looks like:

```
Plugins and skills are not just features anymore.

They're how AI systems stop being chatbots and start becoming workers.

I spent last week integrating Claude plugins into our internal IT automation workflow at Atos.
The difference was immediate...

[full post continues]

📊 ~1,420 chars | Best time: Tuesday, 8:30 AM IST

---

Hello Friends 👋

A client asked me last month: "Our AI pilot looks impressive in demos. Why does it fall apart in production?"

The answer I gave them surprised even me...

[full post continues]

📊 ~1,610 chars | Best time: Wednesday, 9:00 AM IST
```

## Persona

Posts are written as **Abhilash Jaiswal** — GenAI Lead, Future-ready CTO, Patent Holder at Atos GDC India.

Key voice characteristics captured:
- Warm opener ("Hello Friends", "Hey") — human, not corporate
- Shares real hands-on experiments and learnings from building GenAI systems
- Practitioner voice — has actually built AI agents, copilots, automations at Atos
- Bridges technical depth with business value
- Confident, curious, invites debate
- India/APAC professional context

To adapt for a different persona, edit `src/persona.ts` (CLI agent) or `packages/api-server/src/adapters/LinkedInAdapter.ts` (web UI).

## Project Structure

```
linkedin-content-generator/
├── src/
│   ├── index.ts        # CLI agent entry point
│   ├── persona.ts      # Persona configuration (used by CLI)
│   ├── prompts.ts      # Prompts for CLI agent
│   └── types.ts        # TypeScript type definitions
└── package.json
```

**Web UI uses:** `packages/api-server/src/adapters/LinkedInAdapter.ts`

## Development

```bash
npm run typecheck   # Type check
npm run build       # Compile TypeScript
npm run dev         # Watch mode
```

## Author

**Abhilash Jaiswal** — [linkedin.com/in/jaiswal-abhilash](https://linkedin.com/in/jaiswal-abhilash)
GenAI Lead | Future-ready CTO | Patent Holder at Atos GDC India
