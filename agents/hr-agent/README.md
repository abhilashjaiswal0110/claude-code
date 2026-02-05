# HR Agent

AI-powered HR assistant for policy guidance, benefits explanation, engagement analysis, and onboarding.

## Modes

| Mode | Description |
|------|-------------|
| `policy` | Answer employee questions about HR policies |
| `benefits` | Explain eligibility, enrollment, and benefit packages |
| `engagement` | Analyze survey results and generate insights |
| `onboarding` | Create personalized onboarding plans for new hires |
| `exit-interview` | Analyze exit interview patterns and generate insights |

## Usage

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run with default mode (policy)
npm start "What is the work from home policy?"

# Run with specific mode
npm start -- --mode benefits "What health insurance options are available?"
npm start -- --mode engagement "Analyze Q4 engagement survey results"
npm start -- --mode onboarding "New software engineer joining cloud team"
npm start -- --mode exit-interview "Summarize exit interview trends Q3-Q4"
```

## Pipeline Stages

1. **Classification** - Classify query type, sensitivity, and routing
2. **Policy Search** - Search policy documents and knowledge base
3. **Response Generation** - Generate comprehensive response
4. **Compliance Check** - Verify compliance, add disclaimers

## Data Directory

Place policy documents in `data/` subdirectories:
- `data/policies/` - HR policy documents
- `data/faqs/` - Frequently asked questions
- `data/templates/` - Response and document templates

## Budget

| Stage | Max Turns | Max Budget |
|-------|:---------:|:----------:|
| Classification | 3 | - |
| Policy Search | 8 | $1.00 |
| Response | 5 | - |
| Compliance | 3 | - |
| **Total** | | **$2.25** |
