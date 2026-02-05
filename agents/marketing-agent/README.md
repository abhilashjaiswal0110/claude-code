# Marketing & Communication Agent

AI-powered marketing content generation for Atos enterprise communications.

## Modes

| Mode | Description |
|------|-------------|
| `blog` | Long-form technical blog posts with SEO optimization |
| `social` | Weekly social media content calendar across platforms |
| `campaign` | Full campaign briefs with messaging and channel strategy |
| `press-release` | AP-style press releases with Atos brand voice |
| `newsletter` | Email newsletters with subject lines and CTAs |

## Usage

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run with default mode (blog)
npm start "AI in Enterprise Digital Transformation"

# Run with specific mode
npm start -- --mode social "Cloud Security Trends 2025"
npm start -- --mode campaign "Atos Hybrid Cloud Launch"
npm start -- --mode press-release "New Partnership Announcement"
npm start -- --mode newsletter "Q1 Technology Insights"
```

## Pipeline Stages

1. **Research** - Web search for trends, data, and competitive landscape
2. **Strategy** - Content strategy and messaging framework development
3. **Generation** - Full content creation based on research and strategy
4. **Optimization** - SEO, scheduling, and distribution recommendations

## Output

Generated content is saved to the `output/` directory in both text and JSON formats.

## Budget

| Stage | Max Turns | Max Budget |
|-------|:---------:|:----------:|
| Research | 15 | $2.00 |
| Strategy | 5 | - |
| Generation | 5 | - |
| Optimization | 3 | - |
| **Total** | | **$3.50** |
