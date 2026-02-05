# Recruitment Agent

AI-powered recruitment assistant with built-in bias detection and compliance checking.

## Modes

| Mode | Description |
|------|-------------|
| `jd` | Generate detailed, inclusive job descriptions |
| `screening` | Create resume screening frameworks and rubrics |
| `interview` | Generate structured interview questions by competency |
| `comparison` | Build candidate scoring matrices for comparison |
| `offer` | Draft role-specific offer letter templates |

## Usage

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run with default mode (jd)
npm start "Senior Cloud Solutions Architect"

# Run with specific mode
npm start -- --mode screening "DevOps Engineer with Kubernetes experience"
npm start -- --mode interview "Data Science Lead - ML Engineering"
npm start -- --mode comparison "3 finalists for VP Engineering role"
npm start -- --mode offer "Senior Software Engineer - London office"
```

## Pipeline Stages

1. **Role Understanding** - Analyze requirements and compliance context
2. **Market Research** - Salary benchmarks, skills demand, competitor hiring
3. **Content Generation** - Generate recruitment content for selected mode
4. **Bias & Compliance Check** - Review for inclusive language and legal compliance

## Compliance Features

Every pipeline run includes automatic checking for:
- Gendered and age-indicative language
- Culturally biased requirements
- Equal opportunity statement completeness
- GDPR data protection compliance
- Accessibility considerations

## Budget

| Stage | Max Turns | Max Budget |
|-------|:---------:|:----------:|
| Role Understanding | 5 | - |
| Market Research | 10 | $1.50 |
| Content Generation | 8 | - |
| Bias Check | 5 | - |
| **Total** | | **$4.00** |
