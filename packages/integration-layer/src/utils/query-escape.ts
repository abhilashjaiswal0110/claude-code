/**
 * Query Escape Utilities
 *
 * Security utilities for escaping user input in various query languages
 * to prevent injection attacks.
 */

/**
 * Escape value for ServiceNow encoded query syntax
 * ServiceNow uses ^ as AND operator and special characters need escaping
 */
export function escapeServiceNowQuery(value: string): string {
  if (!value) return '';
  // Escape backslash, caret, single/double quotes
  return value.replace(/[\\^'"]/g, (c) => `\\${c}`);
}

/**
 * Escape value for Salesforce SOQL queries
 * SOQL requires escaping single quotes, backslashes, and special characters
 */
export function escapeSOQL(value: string): string {
  if (!value) return '';
  // Escape backslash first, then single quote (SOQL uses single quotes for strings)
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Escape value for Jira JQL queries
 * JQL requires escaping special characters in string values
 */
export function escapeJQL(value: string): string {
  if (!value) return '';
  // JQL special characters that need quoting: space, +, ., ;, ?, *, /, %, ^, $, #, @, [, ]
  // If value contains special chars, wrap in quotes and escape internal quotes
  const needsQuoting = /[\s+.;?*/%^$#@[\]\\"]/.test(value);
  if (needsQuoting) {
    // Escape backslashes and double quotes, then wrap in quotes
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return value;
}

/**
 * Escape value for SAP OData $filter queries
 * OData requires escaping single quotes by doubling them
 */
export function escapeOData(value: string): string {
  if (!value) return '';
  // OData escapes single quotes by doubling them
  return value.replace(/'/g, "''");
}

/**
 * Validate and sanitize alphanumeric identifiers (e.g., project keys, user IDs)
 * Returns null if invalid, sanitized value otherwise
 */
export function sanitizeIdentifier(value: string, allowedPattern = /^[a-zA-Z0-9_-]+$/): string | null {
  if (!value || !allowedPattern.test(value)) {
    return null;
  }
  return value;
}

/**
 * Validate numeric string
 */
export function sanitizeNumeric(value: string | number): number | null {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  return num;
}

/**
 * Validate ISO date string format
 */
export function sanitizeISODate(value: string): string | null {
  if (!value) return null;
  // ISO 8601 date format: YYYY-MM-DD or full datetime
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoDatePattern.test(value)) {
    return null;
  }
  // Additional validation via Date parsing
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  return value;
}
