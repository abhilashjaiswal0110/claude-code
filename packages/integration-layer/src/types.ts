/**
 * Core types for enterprise integration layer
 */

export interface IntegrationConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  circuitBreaker?: CircuitBreakerConfig;
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
}

export interface CircuitBreakerConfig {
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
  volumeThreshold: number;
}

export interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration?: number;
}

export interface AuthConfig {
  type: 'basic' | 'oauth2' | 'api_key' | 'jwt' | 'saml';
  credentials: Record<string, string>;
  tokenEndpoint?: string;
  refreshToken?: string;
}

export interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  lastCheck: Date;
  errorCount: number;
  circuitState: 'closed' | 'open' | 'half-open';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ServiceNow Types
export interface ServiceNowIncident {
  sys_id: string;
  number: string;
  short_description: string;
  description: string;
  priority: string;
  state: string;
  assigned_to: string;
  assignment_group: string;
  category: string;
  subcategory: string;
  impact: string;
  urgency: string;
  opened_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

// Workday Types
export interface WorkdayEmployee {
  workerId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  manager: string;
  location: string;
  hireDate: string;
  status: 'active' | 'terminated' | 'leave';
}

// Salesforce Types
export interface SalesforceOpportunity {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  amount: number;
  stage: string;
  probability: number;
  closeDate: string;
  ownerId: string;
  ownerName: string;
  description: string;
}

// Azure AD Types
export interface AzureADUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  mail: string;
  department: string;
  jobTitle: string;
  officeLocation: string;
  accountEnabled: boolean;
  createdDateTime: string;
  groups: string[];
}

// SAP Types
export interface SAPMaterialMaster {
  materialNumber: string;
  description: string;
  materialType: string;
  materialGroup: string;
  baseUnitOfMeasure: string;
  plant: string;
  storageLocation: string;
  purchasingGroup: string;
  standardPrice: number;
  currency: string;
}

// Jira Types
export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string;
  issueType: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  project: string;
  created: string;
  updated: string;
  labels: string[];
}
