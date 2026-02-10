/**
 * Jira Connector
 *
 * Integration with Atlassian Jira for issue tracking,
 * project management, and development workflows.
 *
 * PLACEHOLDER: Configure JIRA_* environment variables
 * for production deployment.
 */

import { BaseConnector } from './base-connector.js';
import { INTEGRATION_ENDPOINTS } from '../config.js';
import type { IntegrationConfig, JiraIssue, PaginatedResponse } from '../types.js';
import { logger } from '../monitoring/logger.js';

export class JiraConnector extends BaseConnector {
  constructor(config: IntegrationConfig) {
    super('Jira', config);
  }

  /**
   * Get issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    const result = await this.execute<{
      id: string;
      key: string;
      fields: {
        summary: string;
        description: string;
        issuetype: { name: string };
        status: { name: string };
        priority: { name: string };
        assignee: { displayName: string } | null;
        reporter: { displayName: string };
        project: { key: string };
        created: string;
        updated: string;
        labels: string[];
      };
    }>(
      () => this.client.get(`${INTEGRATION_ENDPOINTS.jira.issues}/${issueKey}`),
      `getIssue(${issueKey})`
    );

    return {
      id: result.id,
      key: result.key,
      summary: result.fields.summary,
      description: result.fields.description,
      issueType: result.fields.issuetype.name,
      status: result.fields.status.name,
      priority: result.fields.priority.name,
      assignee: result.fields.assignee?.displayName ?? 'Unassigned',
      reporter: result.fields.reporter.displayName,
      project: result.fields.project.key,
      created: result.fields.created,
      updated: result.fields.updated,
      labels: result.fields.labels,
    };
  }

  /**
   * Search issues with JQL
   */
  async searchIssues(query: {
    jql?: string;
    project?: string;
    status?: string;
    assignee?: string;
    issueType?: string;
    labels?: string[];
    limit?: number;
    startAt?: number;
  }): Promise<PaginatedResponse<JiraIssue>> {
    // Build JQL query
    const conditions: string[] = [];

    if (query.project) conditions.push(`project = ${query.project}`);
    if (query.status) conditions.push(`status = "${query.status}"`);
    if (query.assignee) conditions.push(`assignee = ${query.assignee}`);
    if (query.issueType) conditions.push(`issuetype = "${query.issueType}"`);
    if (query.labels?.length) conditions.push(`labels in (${query.labels.join(',')})`);

    const jql = query.jql || (conditions.length > 0 ? conditions.join(' AND ') : 'order by created DESC');

    logger.info(`[Jira] Searching with JQL: ${jql}`);

    const result = await this.execute<{
      issues: Array<{
        id: string;
        key: string;
        fields: {
          summary: string;
          description: string;
          issuetype: { name: string };
          status: { name: string };
          priority: { name: string };
          assignee: { displayName: string } | null;
          reporter: { displayName: string };
          project: { key: string };
          created: string;
          updated: string;
          labels: string[];
        };
      }>;
      total: number;
    }>(
      () => this.client.post(INTEGRATION_ENDPOINTS.jira.search, {
        jql,
        maxResults: query.limit ?? 50,
        startAt: query.startAt ?? 0,
        fields: ['summary', 'description', 'issuetype', 'status', 'priority', 'assignee', 'reporter', 'project', 'created', 'updated', 'labels'],
      }),
      'searchIssues'
    );

    return {
      data: result.issues.map((issue) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        issueType: issue.fields.issuetype.name,
        status: issue.fields.status.name,
        priority: issue.fields.priority.name,
        assignee: issue.fields.assignee?.displayName ?? 'Unassigned',
        reporter: issue.fields.reporter.displayName,
        project: issue.fields.project.key,
        created: issue.fields.created,
        updated: issue.fields.updated,
        labels: issue.fields.labels,
      })),
      total: result.total,
      page: Math.floor((query.startAt ?? 0) / (query.limit ?? 50)) + 1,
      pageSize: query.limit ?? 50,
      hasMore: (query.startAt ?? 0) + result.issues.length < result.total,
    };
  }

  /**
   * Create new issue
   */
  async createIssue(issue: {
    project: string;
    issueType: string;
    summary: string;
    description?: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
  }): Promise<JiraIssue> {
    logger.info(`[Jira] Creating issue: ${issue.summary}`);

    const result = await this.execute<{ id: string; key: string }>(
      () => this.client.post(INTEGRATION_ENDPOINTS.jira.issues, {
        fields: {
          project: { key: issue.project },
          issuetype: { name: issue.issueType },
          summary: issue.summary,
          description: issue.description,
          priority: issue.priority ? { name: issue.priority } : undefined,
          assignee: issue.assignee ? { name: issue.assignee } : undefined,
          labels: issue.labels,
        },
      }),
      'createIssue'
    );

    // Fetch the created issue to return full details
    return this.getIssue(result.key);
  }

  /**
   * Get sprint metrics
   */
  async getSprintMetrics(boardId: string): Promise<{
    activeSprint: string;
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    velocity: number;
    burndownProgress: number;
  }> {
    // PLACEHOLDER: Implement actual sprint metrics
    // In production, use Jira Agile API

    logger.info(`[Jira] Fetching sprint metrics for board: ${boardId}`);

    return {
      activeSprint: '',
      totalPoints: 0,
      completedPoints: 0,
      remainingPoints: 0,
      velocity: 0,
      burndownProgress: 0,
    };
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectKey: string): Promise<{
    totalIssues: number;
    openIssues: number;
    inProgressIssues: number;
    doneIssues: number;
    avgResolutionDays: number;
    issuesByType: Record<string, number>;
  }> {
    // PLACEHOLDER: Implement actual project statistics

    logger.info(`[Jira] Fetching project stats: ${projectKey}`);

    return {
      totalIssues: 0,
      openIssues: 0,
      inProgressIssues: 0,
      doneIssues: 0,
      avgResolutionDays: 0,
      issuesByType: {},
    };
  }

  /**
   * Test Jira connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.execute<unknown>(
        () => this.client.get(INTEGRATION_ENDPOINTS.jira.projects),
        'testConnection'
      );
      return true;
    } catch {
      return false;
    }
  }
}
