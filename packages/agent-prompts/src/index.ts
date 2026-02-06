/**
 * @enterprise-agents/prompts
 *
 * Shared enterprise prompt fragments for AI agents.
 */

export { ATOS_COMPANY_CONTEXT, ATOS_DIFFERENTIATORS } from './atos-context.js';
export {
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER,
  HR_COMPLIANCE_RULES,
  RECRUITMENT_COMPLIANCE_RULES,
  SECURITY_RULES,
  SUSTAINABILITY_COMPLIANCE_RULES,
  ACCESSIBILITY_COMPLIANCE_RULES,
  CLOUD_OPERATIONS_COMPLIANCE_RULES,
} from './enterprise-rules.js';
export {
  formatExecutiveSummary,
  formatMarkdownReport,
  formatBulletList,
  formatNumberedList,
  wrapSection,
} from './output-formats.js';
