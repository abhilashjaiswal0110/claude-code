---
description: Execute the Recruitment agent for bias-free job descriptions, candidate screening, interview questions, candidate comparisons, and offer letters
allowed-tools: Bash(cd:*), Bash(npm:*)
---

# Recruitment Agent Command

Execute the Recruitment agent for bias-free job descriptions, candidate screening, interview questions, candidate comparisons, and offer letters.

## Usage

```bash
/recruitment <position-or-query> [--mode <mode>] [--context <requirements>]
```

## Modes

- `jd` - Job description generation (default)
- `screening` - Candidate screening criteria
- `interview` - Interview question sets
- `comparison` - Candidate comparison analysis
- `offer` - Offer letter generation

## Examples

```bash
# Generate job description
/recruitment Senior Software Engineer with AI/ML experience

# Screening criteria
/recruitment --mode screening --context "5+ years Python, distributed systems, leadership" Senior Backend Engineer

# Interview questions
/recruitment --mode interview DevOps Engineer with Kubernetes expertise

# Compare candidates
/recruitment --mode comparison --context "Candidate A: 7yrs exp, strong tech, weak soft skills. Candidate B: 4yrs exp, good communicator, less depth" Senior Developer role

# Offer letter
/recruitment --mode offer --context "120K base, 20K bonus, remote, start 30 days" Sarah Johnson - Senior Engineer
```

## Implementation

When this command is invoked:

1. **Parse input with bias detection**
   - Extract position, requirements, context
   - Scan for biased language (age, gender, origin terms)
   - Flag problematic phrases immediately

2. **Mode determination**
   - Keywords "JD", "job description", "hiring for" → `jd` mode
   - Keywords "screen", "evaluate", "qualify" → `screening` mode
   - Keywords "interview", "questions", "ask" → `interview` mode
   - Keywords "compare", "vs", "which candidate" → `comparison` mode
   - Keywords "offer", "contract", "salary" → `offer` mode

3. **Execute with bias detection pipeline**
   ```typescript
   const agentPath = join(process.cwd(), 'agents/recruitment-agent');

   // Recruitment agent stages:
   // 1. Requirements Analysis - Extract skills, experience, qualifications
   // 2. Bias Detection - Scan for discriminatory language
   // 3. Content Generation - Create JD/questions/criteria
   // 4. Compliance Check - Legal, EEO, accessibility

   const cmd = `cd "${agentPath}" && npm start -- "${query}" --mode ${mode}${context ? ` --context "${context}"` : ''}`;

   execWithBiasAlert(cmd, {
     onBiasDetected: (issues) => {
       logger.warn('⚠️  Potential bias detected:');
       issues.forEach(issue => logger.warn(`  - ${issue.phrase}: ${issue.reason}`));
       // Offer to rephrase automatically
     }
   });
   ```

4. **Display results with compliance badges**
   - ✅ Bias-free language
   - ✅ ADA compliant
   - ✅ EEO statement included
   - ✅ Salary transparency (if applicable)
   - ✅ Skills-focused criteria

5. **Post-generation validation**
   - Run through bias detection tool
   - Check against EEOC guidelines
   - Verify skills are measurable
   - Ensure no age/gender/origin indicators

## Bias Detection Examples

**Problematic phrases flagged:**
- ❌ "Recent graduate" → Implies age discrimination
- ❌ "Native English speaker" → National origin bias
- ❌ "Energetic" / "Digital native" → Age proxies
- ❌ "Cultural fit" → Can mask discrimination
- ❌ "Strong back" → Physical ability bias

**Suggested rewrites:**
- ✅ "0-2 years experience" (specific, measurable)
- ✅ "Proficiency in English required" (skill-based)
- ✅ "Quick learner" (neutral)
- ✅ "Aligns with company values" (specific values listed)
- ✅ "Ability to lift 25 lbs" (specific, job-related)

## Output Format

The Recruitment agent generates:
- **Console**: Formatted JD/criteria/questions with bias report
- **JSON**: `agents/recruitment-agent/output/recruitment-{mode}-{timestamp}.json`
  ```json
  {
    "position": "Senior Software Engineer",
    "mode": "jd",
    "requirements": { ... },
    "content": "...",
    "biasCheck": {
      "passed": true,
      "issues": [],
      "suggestions": []
    },
    "compliance": {
      "eeoc": true,
      "ada": true,
      "salary_transparency": "compliant"
    }
  }
  ```

## Integration with Skills

Leverages **recruitment-expertise** skill for:
- Inclusive language patterns
- Skills-based hiring frameworks
- Structured interview techniques
- Candidate evaluation rubrics
- Offer negotiation strategies

## Workflow Integration

### Recruitment Pipeline Workflow
```bash
/workflow recruitment-pipeline "Senior Data Scientist"

# Automatically runs:
# 1. /recruitment --mode jd
# 2. /recruitment --mode screening
# 3. /recruitment --mode interview
# 4. Creates tracking spreadsheet
# 5. Generates hiring rubric
```

### Hire-to-Onboard Workflow
```bash
/workflow hire-to-onboard "Jane Doe - Senior Engineer"

# Runs:
# 1. /recruitment --mode offer
# 2. /hr --mode onboarding (once accepted)
# 3. /it-ops --mode automation (provision resources)
# 4. /learning --mode learning-path (role-specific)
```

## Best Practices

### Job Description Creation
1. **Lead with mission** - Why does this role exist?
2. **Skills over years** - "Proficient in X" not "5+ years"
3. **Essential vs desired** - Clear must-haves vs nice-to-haves
4. **Realistic expectations** - Don't demand unicorns
5. **Growth path** - Show career progression

### Interview Question Design
1. **Behavioral** - "Tell me about a time..."
2. **Situational** - "How would you handle..."
3. **Technical** - Practical skills assessment
4. **Problem-solving** - Real scenarios, not gotchas
5. **Reverse interview** - Let candidates assess us

### Candidate Comparison
1. **Rubric-based** - Consistent criteria for all
2. **Skill-weighted** - Weight by importance
3. **Documented** - Record rationale for decisions
4. **Team input** - Multiple evaluators
5. **Bias check** - Review for unfair factors

## Legal Compliance

**Automatically includes:**
- EEO statement
- ADA reasonable accommodation notice
- Salary range (if legally required by location)
- Non-discrimination policy
- Application instructions

**Warns about:**
- Questions that violate EEOC guidelines
- Requests for protected class information
- Unnecessary physical requirements
- Discriminatory screening criteria

## Teaching Notes

**Architectural pattern: Guard Rails**

The Recruitment agent implements the **guard rails pattern** - it doesn't just generate content, it actively prevents harmful output. This is critical for:
- Legal compliance (lawsuits are expensive!)
- Inclusive hiring (diverse teams perform better)
- Company reputation (bad JDs go viral)

**How it works:**
1. **Pre-generation** - Scan input for bias
2. **During generation** - Use inclusive templates
3. **Post-generation** - Validate output against rules
4. **Continuous** - Learn from flagged issues

**Compare to:**
- Code linters (catch bugs before runtime)
- Security scanners (find vulnerabilities)
- Accessibility checkers (ensure a11y compliance)

**Key insight:** The best way to handle bias isn't to detect it at the end - it's to structure the generation process so bias can't enter. This is **prevention over detection**.

## Advanced Features

### Diversity-Focused Sourcing
```bash
/recruitment --mode jd --diversity-channels "Include sourcing suggestions for underrepresented groups"
```

### Skill Gap Analysis
```bash
/recruitment --mode screening --context "Current team: {skills}" --skill-gap
# Identifies skills missing from current team
```

### Interview Panel Builder
```bash
/recruitment --mode interview --panel-diversity
# Suggests diverse interview panel composition
```

## Customization

Configure in `.claude/enterprise-agents/recruitment-config.json`:

```json
{
  "bias_detection": {
    "strictness": "high",
    "custom_flags": ["rockstar", "ninja", "guru"],
    "auto_rephrase": true
  },
  "compliance": {
    "locations": ["CA", "NYC", "CO"],  // Salary transparency required
    "require_eeoc": true,
    "ada_notice": true
  },
  "templates": {
    "company_values": ["Innovation", "Inclusion", "Impact"],
    "benefits_summary": "..."
  }
}
```
