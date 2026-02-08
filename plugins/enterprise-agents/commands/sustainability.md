# Sustainability Agent Command

IT sustainability, carbon footprint analysis, green IT recommendations, and ESG compliance.

## Usage

```bash
/sustainability <query> [--mode <mode>] [--context <details>]
```

## Modes

- `carbon-footprint` - Carbon footprint analysis (default)
- `green-it` - Green IT recommendations
- `sustainability-report` - Sustainability reporting
- `energy-optimization` - Energy efficiency optimization
- `esg-compliance` - ESG compliance assessment

## Examples

```bash
/sustainability Data center carbon footprint assessment
/sustainability --mode green-it --context "AWS, 200 EC2 instances, EU region" Cloud infrastructure optimization
/sustainability --mode esg-compliance Annual sustainability report for tech operations
```

## Output

- Console: Sustainability analysis and recommendations
- JSON: `agents/sustainability-agent/output/sustainability-{mode}-{timestamp}.json`
- Includes: Metrics, recommendations, compliance status, ROI

## Chain with

- `/cloud-ops` → Cloud sustainability optimization
- `/it-ops` → Green automation practices
- `/marketing` → Sustainability messaging
