/**
 * ServiceNow Connector
 *
 * Integration with ServiceNow ITSM for incident management,
 * change requests, CMDB, and knowledge base.
 *
 * PLACEHOLDER: Configure SERVICENOW_INSTANCE, USERNAME, PASSWORD
 * environment variables for production deployment.
 */

import { BaseConnector } from './base-connector.js';
import { INTEGRATION_ENDPOINTS } from '../config.js';
import type { IntegrationConfig, ServiceNowIncident, PaginatedResponse } from '../types.js';
import { logger } from '../monitoring/logger.js';

export class ServiceNowConnector extends BaseConnector {
  constructor(config: IntegrationConfig) {
    super('ServiceNow', config);
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<ServiceNowIncident> {
    return this.execute<ServiceNowIncident>(
      () => this.client.get(`${INTEGRATION_ENDPOINTS.servicenow.incidents}/${incidentId}`),
      `getIncident(${incidentId})`
    );
  }

  /**
   * Search incidents with filters
   */
  async searchIncidents(query: {
    state?: string;
    priority?: string;
    assignmentGroup?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<ServiceNowIncident>> {
    const params = new URLSearchParams();

    if (query.state) params.append('sysparm_query', `state=${query.state}`);
    if (query.priority) params.append('sysparm_query', `priority=${query.priority}`);
    if (query.assignmentGroup) params.append('sysparm_query', `assignment_group=${query.assignmentGroup}`);
    if (query.category) params.append('sysparm_query', `category=${query.category}`);
    params.append('sysparm_limit', String(query.limit ?? 50));
    params.append('sysparm_offset', String(query.offset ?? 0));

    const result = await this.execute<{ result: ServiceNowIncident[] }>(
      () => this.client.get(`${INTEGRATION_ENDPOINTS.servicenow.incidents}?${params.toString()}`),
      'searchIncidents'
    );

    return {
      data: result.result,
      total: result.result.length,
      page: Math.floor((query.offset ?? 0) / (query.limit ?? 50)) + 1,
      pageSize: query.limit ?? 50,
      hasMore: result.result.length === (query.limit ?? 50),
    };
  }

  /**
   * Create new incident
   */
  async createIncident(incident: Partial<ServiceNowIncident>): Promise<ServiceNowIncident> {
    logger.info(`[ServiceNow] Creating incident: ${incident.short_description}`);

    return this.execute<ServiceNowIncident>(
      () => this.client.post(INTEGRATION_ENDPOINTS.servicenow.incidents, incident),
      'createIncident'
    );
  }

  /**
   * Update incident
   */
  async updateIncident(incidentId: string, updates: Partial<ServiceNowIncident>): Promise<ServiceNowIncident> {
    logger.info(`[ServiceNow] Updating incident: ${incidentId}`);

    return this.execute<ServiceNowIncident>(
      () => this.client.patch(`${INTEGRATION_ENDPOINTS.servicenow.incidents}/${incidentId}`, updates),
      `updateIncident(${incidentId})`
    );
  }

  /**
   * Search knowledge base articles
   */
  async searchKnowledgeBase(query: string, limit = 10): Promise<Array<{ sys_id: string; short_description: string; text: string }>> {
    const params = new URLSearchParams({
      sysparm_query: `short_descriptionLIKE${query}^ORtextLIKE${query}`,
      sysparm_limit: String(limit),
    });

    const result = await this.execute<{ result: Array<{ sys_id: string; short_description: string; text: string }> }>(
      () => this.client.get(`${INTEGRATION_ENDPOINTS.servicenow.knowledgeBase}?${params.toString()}`),
      'searchKnowledgeBase'
    );

    return result.result;
  }

  /**
   * Get incident metrics for dashboard
   */
  async getIncidentMetrics(): Promise<{
    totalOpen: number;
    criticalCount: number;
    avgResolutionTime: number;
    breachedSLA: number;
  }> {
    // PLACEHOLDER: Implement actual metrics aggregation
    // In production, use ServiceNow reporting API or Performance Analytics

    logger.info('[ServiceNow] Fetching incident metrics');

    return {
      totalOpen: 0,
      criticalCount: 0,
      avgResolutionTime: 0,
      breachedSLA: 0,
    };
  }

  /**
   * Test ServiceNow connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.execute<{ result: { stats: { count: number } } }>(
        () => this.client.get(`${INTEGRATION_ENDPOINTS.servicenow.incidents}?sysparm_limit=1`),
        'testConnection'
      );
      return true;
    } catch {
      return false;
    }
  }
}
