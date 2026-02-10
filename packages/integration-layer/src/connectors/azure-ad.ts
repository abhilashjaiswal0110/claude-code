/**
 * Azure AD (Microsoft Entra ID) Connector
 *
 * Integration with Azure Active Directory for user management,
 * group memberships, and application access.
 *
 * PLACEHOLDER: Configure AZURE_* environment variables
 * for production deployment.
 */

import { BaseConnector } from './base-connector.js';
import { INTEGRATION_ENDPOINTS } from '../config.js';
import type { IntegrationConfig, AzureADUser, PaginatedResponse } from '../types.js';
import { logger } from '../monitoring/logger.js';

export class AzureADConnector extends BaseConnector {
  constructor(config: IntegrationConfig) {
    // Azure AD uses Microsoft Graph API
    super('AzureAD', {
      ...config,
      baseUrl: 'https://graph.microsoft.com',
    });
  }

  /**
   * Get user by ID or UPN
   */
  async getUser(userIdOrUpn: string): Promise<AzureADUser> {
    return this.execute<AzureADUser>(
      () => this.client.get(`/v1.0/users/${userIdOrUpn}`),
      `getUser(${userIdOrUpn})`
    );
  }

  /**
   * Search users with filters
   */
  async searchUsers(query: {
    department?: string;
    jobTitle?: string;
    officeLocation?: string;
    accountEnabled?: boolean;
    searchText?: string;
    limit?: number;
  }): Promise<PaginatedResponse<AzureADUser>> {
    const filters: string[] = [];

    if (query.department) filters.push(`department eq '${query.department}'`);
    if (query.jobTitle) filters.push(`jobTitle eq '${query.jobTitle}'`);
    if (query.officeLocation) filters.push(`officeLocation eq '${query.officeLocation}'`);
    if (query.accountEnabled !== undefined) filters.push(`accountEnabled eq ${query.accountEnabled}`);

    const params: Record<string, string> = {
      $top: String(query.limit ?? 50),
      $select: 'id,userPrincipalName,displayName,mail,department,jobTitle,officeLocation,accountEnabled,createdDateTime',
    };

    if (filters.length > 0) params.$filter = filters.join(' and ');
    if (query.searchText) params.$search = `"displayName:${query.searchText}" OR "mail:${query.searchText}"`;

    logger.info(`[AzureAD] Searching users: ${JSON.stringify(query)}`);

    const result = await this.execute<{ value: AzureADUser[]; '@odata.count'?: number }>(
      () => this.client.get('/v1.0/users', {
        params,
        headers: query.searchText ? { ConsistencyLevel: 'eventual' } : {},
      }),
      'searchUsers'
    );

    return {
      data: result.value,
      total: result['@odata.count'] ?? result.value.length,
      page: 1,
      pageSize: query.limit ?? 50,
      hasMore: result.value.length === (query.limit ?? 50),
    };
  }

  /**
   * Get user's group memberships
   */
  async getUserGroups(userId: string): Promise<Array<{
    id: string;
    displayName: string;
    description: string;
    groupTypes: string[];
  }>> {
    const result = await this.execute<{ value: Array<{
      id: string;
      displayName: string;
      description: string;
      groupTypes: string[];
    }> }>(
      () => this.client.get(`/v1.0/users/${userId}/memberOf`),
      `getUserGroups(${userId})`
    );

    return result.value;
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<AzureADUser[]> {
    const result = await this.execute<{ value: AzureADUser[] }>(
      () => this.client.get(`/v1.0/groups/${groupId}/members`),
      `getGroupMembers(${groupId})`
    );

    return result.value;
  }

  /**
   * Check if user is member of group
   */
  async checkGroupMembership(userId: string, groupId: string): Promise<boolean> {
    try {
      const result = await this.execute<{ value: boolean }>(
        () => this.client.post(`/v1.0/users/${userId}/checkMemberGroups`, {
          groupIds: [groupId],
        }),
        'checkGroupMembership'
      );

      return result.value;
    } catch {
      return false;
    }
  }

  /**
   * Get sign-in activity (requires Azure AD Premium)
   */
  async getSignInActivity(userId: string, days = 30): Promise<Array<{
    id: string;
    createdDateTime: string;
    status: { errorCode: number; failureReason: string };
    ipAddress: string;
    location: { city: string; countryOrRegion: string };
    appDisplayName: string;
  }>> {
    const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const result = await this.execute<{ value: Array<{
      id: string;
      createdDateTime: string;
      status: { errorCode: number; failureReason: string };
      ipAddress: string;
      location: { city: string; countryOrRegion: string };
      appDisplayName: string;
    }> }>(
      () => this.client.get('/v1.0/auditLogs/signIns', {
        params: {
          $filter: `userId eq '${userId}' and createdDateTime ge ${dateFilter}`,
          $top: 100,
        },
      }),
      `getSignInActivity(${userId})`
    );

    return result.value;
  }

  /**
   * Get directory statistics
   */
  async getDirectoryStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    guestUsers: number;
    totalGroups: number;
    totalApplications: number;
  }> {
    // PLACEHOLDER: Implement actual directory statistics
    // In production, use Microsoft Graph Reports API

    logger.info('[AzureAD] Fetching directory statistics');

    return {
      totalUsers: 0,
      activeUsers: 0,
      guestUsers: 0,
      totalGroups: 0,
      totalApplications: 0,
    };
  }

  /**
   * Test Azure AD connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.execute<unknown>(
        () => this.client.get('/v1.0/organization'),
        'testConnection'
      );
      return true;
    } catch {
      return false;
    }
  }
}
