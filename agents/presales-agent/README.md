# Presales/Sales Agent

AI-powered presales assistant for proposal generation, competitive analysis, and deal support.

## Modes

| Mode | Description |
|------|-------------|
| `proposal` | Full proposal with executive summary, scope, approach, timeline |
| `competitor` | Detailed competitor analysis with win strategy |
| `rfp` | RFP response drafting with compliance mapping |
| `pitch-deck` | Slide-by-slide pitch deck outline with talking points |
| `win-loss` | Deal pattern analysis with lessons learned |

## Usage

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run with default mode (proposal)
npm start "Cloud Migration for European Financial Services Client"

# Run with specific mode
npm start -- --mode competitor "Accenture vs Atos for SAP Migration Deal"
npm start -- --mode rfp "Government Digital Transformation RFP"
npm start -- --mode pitch-deck "AI-Powered Customer Experience Platform"
npm start -- --mode win-loss "Lost deal: Nordic Telecom Managed Services"
```

## Pipeline Stages

1. **Opportunity Analysis** - Assess the deal and match Atos capabilities
2. **Deep Research** - Client, competitor, and market intelligence
3. **Content Generation** - Full content creation for the selected mode
4. **Executive Summary** - CxO-ready summary and key messages
5. **Competitive Positioning** - Win themes and objection handling

## Budget

| Stage | Max Turns | Max Budget |
|-------|:---------:|:----------:|
| Opportunity Analysis | 5 | - |
| Deep Research | 20 | $3.00 |
| Content Generation | 10 | - |
| Executive Summary | 5 | - |
| Competitive Positioning | 3 | - |
| **Total** | | **$6.00** |
