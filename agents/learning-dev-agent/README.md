# Learning & Development Agent

AI-powered L&D assistant for skill gap analysis, learning paths, and professional development planning.

## Modes

| Mode | Description |
|------|-------------|
| `skill-gap` | Current vs required skills comparison with priorities |
| `learning-path` | Personalized multi-phase learning plans |
| `training` | Specific course, book, and lab recommendations |
| `assessment` | Domain-specific competency assessment questions |
| `team-matrix` | Collective team skill analysis and upskilling plans |

## Usage

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run with default mode (learning-path)
npm start "Cloud Solutions Architect career development"

# Run with specific mode
npm start -- --mode skill-gap "Mid-level DevOps engineer targeting SRE role"
npm start -- --mode training "Kubernetes and container orchestration"
npm start -- --mode assessment "Python programming for data engineering"
npm start -- --mode team-matrix "Cloud infrastructure team of 8 engineers"
```

## Pipeline Stages

1. **Profile Analysis** - Analyze role and skill requirements
2. **Market Research** - Research skills demand and learning resources
3. **Gap Analysis & Planning** - Generate tailored development plan
4. **Quality Review** - Review and optimize recommendations

## Budget

| Stage | Max Turns | Max Budget |
|-------|:---------:|:----------:|
| Profile Analysis | 5 | - |
| Market Research | 12 | $1.50 |
| Gap Analysis | 8 | - |
| Quality Review | 3 | - |
| **Total** | | **$3.00** |
