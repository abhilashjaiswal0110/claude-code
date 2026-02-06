# Sustainability Agent

An AI-powered agent for IT sustainability analysis, carbon footprint assessment, green IT strategies, energy optimization, and ESG compliance guidance for managed services.

## Features

- **Carbon Footprint Analysis**: GHG Protocol-aligned Scope 1, 2, 3 emissions assessment
- **Green IT Strategy**: Sustainable infrastructure and data center optimization
- **Sustainability Reporting**: GRI, CDP, TCFD-aligned reporting support
- **Energy Optimization**: Energy efficiency analysis and recommendations
- **ESG Compliance**: Regulatory compliance assessment and gap analysis

## Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `carbon-footprint` | Comprehensive emissions analysis by scope | Annual carbon inventory, reduction planning |
| `green-it` | Sustainable IT infrastructure strategy | Data center optimization, hardware lifecycle |
| `sustainability-report` | ESG report generation | Annual sustainability disclosures |
| `energy-optimization` | Energy efficiency recommendations | Cost reduction, renewable integration |
| `esg-compliance` | Regulatory compliance assessment | CSRD, SEC Climate Rules readiness |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY
   ```

3. Run the agent:
   ```bash
   npm start -- --topic "Your sustainability topic" --mode carbon-footprint
   ```

## Usage Examples

### Carbon Footprint Analysis
```bash
npm start -- --topic "Data center carbon footprint for FY2024" --mode carbon-footprint
```

### Green IT Strategy
```bash
npm start -- --topic "Develop green IT roadmap for cloud migration" --mode green-it
```

### Sustainability Report
```bash
npm start -- --topic "Generate Q3 sustainability metrics report" --mode sustainability-report
```

### Energy Optimization
```bash
npm start -- --topic "Optimize energy consumption across managed infrastructure" --mode energy-optimization
```

### ESG Compliance
```bash
npm start -- --topic "Assess CSRD readiness for IT services" --mode esg-compliance
```

## Pipeline Stages

1. **Assessment** - Context analysis and framework identification
2. **Data Collection** - Metrics gathering and benchmark research
3. **Analysis** - Recommendations and strategy development
4. **Compliance Review** - Standards verification and quality assurance

## Budget

| Stage | Max Budget |
|-------|------------|
| Assessment | $0.75 |
| Data Collection | $1.00 |
| Analysis | $0.75 |
| Compliance Review | $0.25 |
| **Total** | **$2.75** |

## Standards & Frameworks

- GHG Protocol (Scope 1, 2, 3)
- Science-Based Targets initiative (SBTi)
- ISO 14001 / ISO 14064
- GRI Standards
- CDP (Carbon Disclosure Project)
- TCFD (Task Force on Climate-related Financial Disclosures)
- EU CSRD (Corporate Sustainability Reporting Directive)
- SEC Climate Disclosure Rules

## Output

Generated files are saved to `output/` with:
- Timestamped filename: `2025-02-06T143012_sustainability-carbon-footprint_topic-slug.txt`
- Structured JSON: Same filename with `.json` extension

## Data Directory

Place sustainability-related documents in `data/`:
- `data/policies/` - Environmental policies and commitments
- `data/baselines/` - Historical emissions data and baselines
- `data/benchmarks/` - Industry benchmarks and standards
- `data/templates/` - Reporting templates

## License

MIT
