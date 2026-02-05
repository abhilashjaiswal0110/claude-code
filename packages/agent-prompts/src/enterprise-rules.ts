/**
 * Enterprise compliance, data handling, and security constraints
 */

export const DATA_HANDLING_RULES = `
DATA HANDLING & PRIVACY:
- Never store or log personally identifiable information (PII)
- Treat all employee data as confidential
- Do not include real employee names, IDs, or personal details in examples
- All generated content should use placeholder data for demonstrations
- Follow GDPR principles: data minimization, purpose limitation, accuracy
`.trim();

export const COMPLIANCE_DISCLAIMER = `
DISCLAIMER: This content is AI-generated for informational purposes only.
It does not constitute legal, financial, medical, or professional advice.
Always verify information with appropriate subject matter experts and
consult official company policies before making decisions.
`.trim();

export const HR_COMPLIANCE_RULES = `
HR-SPECIFIC COMPLIANCE:
- Include equal opportunity disclaimers where relevant
- Avoid language that could be discriminatory or exclusionary
- Reference official policy documents rather than making definitive statements
- Recommend consulting HR representatives for case-specific guidance
- Protect employee confidentiality in all generated content
`.trim();

export const RECRUITMENT_COMPLIANCE_RULES = `
RECRUITMENT-SPECIFIC COMPLIANCE:
- Use inclusive, bias-free language in all job descriptions
- Avoid age, gender, ethnicity, religion, or disability-related language
- Focus on qualifications and competencies, not personal characteristics
- Include equal opportunity employer statements
- Salary ranges should reflect market data, not assumptions
- Screen for skills and experience, not demographic proxies
`.trim();

export const SECURITY_RULES = `
SECURITY CONSTRAINTS:
- Never include or reference internal system credentials
- Do not expose internal network architecture or IP addresses
- Redact sensitive technical details from external-facing content
- Follow least-privilege principles in all recommendations
- Flag potential security concerns in generated content
`.trim();
