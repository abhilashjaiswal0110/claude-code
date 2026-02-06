# Cloud Operations Agent

An AI-powered agent for cloud operations including cost optimization, incident response, capacity planning, architecture reviews, and migration assessments across AWS, Azure, and GCP.

## Features

- **Cost Optimization**: FinOps-aligned cloud spend analysis and recommendations
- **Incident Response**: SRE-based incident analysis and postmortem generation
- **Capacity Planning**: Growth forecasting and scaling strategy development
- **Architecture Review**: Well-Architected Framework assessments
- **Migration Assessment**: 6Rs-based cloud migration planning

## Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `cost-optimization` | Cloud spend analysis and savings | Monthly cost reviews, budget optimization |
| `incident-response` | Incident analysis and postmortem | P1/P2 incidents, blameless postmortems |
| `capacity-planning` | Resource forecasting and scaling | Quarterly planning, event preparation |
| `architecture-review` | Well-Architected assessment | Design reviews, compliance audits |
| `migration-assessment` | Cloud migration planning | Datacenter exits, cloud adoption |

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
   npm start -- --topic "Your cloud ops topic" --mode cost-optimization
   ```

## Usage Examples

### Cost Optimization
```bash
npm start -- --topic "Optimize AWS costs for production EKS cluster" --mode cost-optimization
```

### Incident Response
```bash
npm start -- --topic "P1 database outage in us-east-1 affecting checkout service" --mode incident-response
```

### Capacity Planning
```bash
npm start -- --topic "Plan capacity for Black Friday traffic spike" --mode capacity-planning
```

### Architecture Review
```bash
npm start -- --topic "Well-Architected review for payment processing system" --mode architecture-review
```

### Migration Assessment
```bash
npm start -- --topic "Migrate on-premises CRM to Azure" --mode migration-assessment
```

## Pipeline Stages

1. **Discovery** - Environment and context analysis
2. **Analysis** - Infrastructure and data review
3. **Recommendations** - Prioritized action items
4. **Operational Review** - Compliance and completeness check

## Budget

| Stage | Max Budget |
|-------|------------|
| Discovery | $0.50 |
| Analysis | $1.00 |
| Recommendations | $0.75 |
| Operational Review | $0.25 |
| **Total** | **$2.50** |

## Frameworks & Standards

### Cloud Providers
- **AWS**: Well-Architected Framework, Cost Explorer, Trusted Advisor
- **Azure**: Well-Architected Framework, Azure Advisor, Cost Management
- **GCP**: Architecture Framework, Recommender, Cost Management

### Operational Frameworks
- **FinOps Foundation**: Cloud financial management principles
- **SRE**: Site Reliability Engineering practices
- **ITIL**: IT service management processes
- **NIST**: Cloud security guidelines

### Well-Architected Pillars
1. Operational Excellence
2. Security
3. Reliability
4. Performance Efficiency
5. Cost Optimization
6. Sustainability

## Migration Strategies (6Rs)

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Rehost | Lift and shift | Quick migration, minimal changes |
| Replatform | Lift and reshape | Some optimization, managed services |
| Refactor | Re-architect | Cloud-native transformation |
| Repurchase | Replace with SaaS | Better alternatives exist |
| Retire | Decommission | No longer needed |
| Retain | Keep on-premises | Compliance, technical constraints |

## Output

Generated files are saved to `output/` with:
- Timestamped filename: `2025-02-06T14-30-12_cloud-ops-cost-optimization_topic-slug.txt`
- Structured JSON: Same filename with `.json` extension

## Data Directory

Place cloud-related documents in `data/`:
- `data/architectures/` - Architecture diagrams and docs
- `data/runbooks/` - Operational runbooks
- `data/configs/` - Infrastructure configurations
- `data/reports/` - Cost reports and metrics

## License

MIT
