/**
 * Integration Configuration
 *
 * Production configuration with environment variable support
 * and sensible defaults for enterprise deployments.
 */

import { z } from 'zod';

const IntegrationEnvSchema = z.object({
  // ServiceNow Configuration
  SERVICENOW_INSTANCE: z.string().optional(),
  SERVICENOW_USERNAME: z.string().optional(),
  SERVICENOW_PASSWORD: z.string().optional(),

  // Workday Configuration
  WORKDAY_TENANT: z.string().optional(),
  WORKDAY_CLIENT_ID: z.string().optional(),
  WORKDAY_CLIENT_SECRET: z.string().optional(),
  WORKDAY_REFRESH_TOKEN: z.string().optional(),

  // Salesforce Configuration
  SALESFORCE_INSTANCE_URL: z.string().optional(),
  SALESFORCE_CLIENT_ID: z.string().optional(),
  SALESFORCE_CLIENT_SECRET: z.string().optional(),
  SALESFORCE_USERNAME: z.string().optional(),
  SALESFORCE_PASSWORD: z.string().optional(),
  SALESFORCE_SECURITY_TOKEN: z.string().optional(),

  // Azure AD Configuration
  AZURE_TENANT_ID: z.string().optional(),
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),

  // SAP Configuration
  SAP_HOST: z.string().optional(),
  SAP_CLIENT: z.string().optional(),
  SAP_USERNAME: z.string().optional(),
  SAP_PASSWORD: z.string().optional(),

  // Jira Configuration
  JIRA_HOST: z.string().optional(),
  JIRA_EMAIL: z.string().optional(),
  JIRA_API_TOKEN: z.string().optional(),

  // Redis Configuration
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // General Configuration
  INTEGRATION_TIMEOUT: z.string().default('30000'),
  INTEGRATION_RETRIES: z.string().default('3'),
  ENABLE_CIRCUIT_BREAKER: z.string().default('true'),
  ENABLE_RATE_LIMITING: z.string().default('true'),
  ENABLE_CACHING: z.string().default('true'),
  CACHE_TTL_SECONDS: z.string().default('300'),
});

export type IntegrationEnv = z.infer<typeof IntegrationEnvSchema>;

export function loadIntegrationConfig(): IntegrationEnv {
  return IntegrationEnvSchema.parse(process.env);
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG = {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  volumeThreshold: 10,
};

export const DEFAULT_RATE_LIMIT_CONFIG = {
  points: 100,
  duration: 60,
  blockDuration: 60,
};

/**
 * Integration Endpoints Configuration
 *
 * PLACEHOLDER: Replace with actual production endpoints
 * during deployment configuration.
 */
export const INTEGRATION_ENDPOINTS = {
  servicenow: {
    incidents: '/api/now/table/incident',
    changes: '/api/now/table/change_request',
    cmdb: '/api/now/table/cmdb_ci',
    knowledgeBase: '/api/now/table/kb_knowledge',
  },
  workday: {
    workers: '/ccx/service/{tenant}/Human_Resources/v40.2',
    positions: '/ccx/service/{tenant}/Staffing/v40.2',
    organizations: '/ccx/service/{tenant}/Human_Resources/v40.2',
    timeOff: '/ccx/service/{tenant}/Time_Tracking/v40.2',
  },
  salesforce: {
    opportunities: '/services/data/v59.0/sobjects/Opportunity',
    accounts: '/services/data/v59.0/sobjects/Account',
    contacts: '/services/data/v59.0/sobjects/Contact',
    leads: '/services/data/v59.0/sobjects/Lead',
  },
  azureAD: {
    users: 'https://graph.microsoft.com/v1.0/users',
    groups: 'https://graph.microsoft.com/v1.0/groups',
    applications: 'https://graph.microsoft.com/v1.0/applications',
  },
  sap: {
    materials: '/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product',
    vendors: '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
    purchaseOrders: '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder',
  },
  jira: {
    issues: '/rest/api/3/issue',
    projects: '/rest/api/3/project',
    search: '/rest/api/3/search',
  },
};
