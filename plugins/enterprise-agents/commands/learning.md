# Learning & Development Agent Command

Skill gap analysis, learning path creation, training material design, and assessment development.

## Usage

```bash
/learning <topic-or-role> [--mode <mode>] [--context <details>]
```

## Modes

- `skill-gap` - Skill gap analysis (default)
- `learning-path` - Personalized learning paths
- `training` - Training material and curriculum
- `assessment` - Assessments and evaluations

## Examples

```bash
/learning Cloud architecture skills for development team
/learning --mode learning-path --context "Mid-level engineer, wants to move to SRE" Career transition to SRE
/learning --mode training Kubernetes certification prep course
/learning --mode assessment Senior developer technical interview
```

## Output

- Console: Learning recommendations
- JSON: `agents/learning-dev-agent/output/learning-{mode}-{timestamp}.json`
- Includes: Resources, timelines, milestones, assessments

## Chain with

- `/hr` → Onboarding training plans
- `/recruitment` → Skills needed for roles
- `/it-ops` → Technical skill development
