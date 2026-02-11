/**
 * Role-Based Access Control (RBAC) Manager
 *
 * Manages permissions, roles, and authorization decisions
 * for enterprise agent access control.
 */

import { logger } from '../monitoring/logger.js';
import type { UserPrincipal, Role, Permission } from './types.js';

export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private initialized = false;

  constructor() {
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default roles for enterprise agents
   */
  private initializeDefaultRoles(): void {
    // Admin role - full access
    this.addRole({
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete', 'execute'] },
      ],
    });

    // Agent Administrator - manage agents and configurations
    this.addRole({
      id: 'agent-admin',
      name: 'Agent Administrator',
      description: 'Manage agents, configurations, and monitor usage',
      permissions: [
        { resource: 'agents', actions: ['create', 'read', 'update', 'delete', 'execute'] },
        { resource: 'sessions', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'config', actions: ['read', 'update'] },
        { resource: 'metrics', actions: ['read'] },
        { resource: 'audit', actions: ['read'] },
      ],
    });

    // Agent User - use agents
    this.addRole({
      id: 'agent-user',
      name: 'Agent User',
      description: 'Use agents and view own sessions',
      permissions: [
        { resource: 'agents', actions: ['read', 'execute'] },
        { resource: 'sessions', actions: ['create', 'read'] },
      ],
    });

    // HR Manager - HR agent access
    this.addRole({
      id: 'hr-manager',
      name: 'HR Manager',
      description: 'Full access to HR agent',
      permissions: [
        { resource: 'agents/hr', actions: ['read', 'execute'] },
        { resource: 'agents/recruitment', actions: ['read', 'execute'] },
        { resource: 'agents/learning', actions: ['read', 'execute'] },
        { resource: 'sessions', actions: ['create', 'read'] },
      ],
    });

    // IT Operations - IT Ops agent access
    this.addRole({
      id: 'it-ops',
      name: 'IT Operations',
      description: 'Full access to IT Operations agent',
      permissions: [
        { resource: 'agents/it-ops', actions: ['read', 'execute'] },
        { resource: 'agents/cloud-ops', actions: ['read', 'execute'] },
        { resource: 'sessions', actions: ['create', 'read'] },
        { resource: 'integrations/servicenow', actions: ['read'] },
        { resource: 'integrations/jira', actions: ['read'] },
      ],
    });

    // Sales - Presales and marketing access
    this.addRole({
      id: 'sales',
      name: 'Sales',
      description: 'Access to sales and marketing agents',
      permissions: [
        { resource: 'agents/presales', actions: ['read', 'execute'] },
        { resource: 'agents/marketing', actions: ['read', 'execute'] },
        { resource: 'agents/linkedin', actions: ['read', 'execute'] },
        { resource: 'sessions', actions: ['create', 'read'] },
        { resource: 'integrations/salesforce', actions: ['read'] },
      ],
    });

    // Viewer - read-only access
    this.addRole({
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to agents',
      permissions: [
        { resource: 'agents', actions: ['read'] },
        { resource: 'sessions', actions: ['read'] },
      ],
    });

    this.initialized = true;
    logger.info('[RBACManager] Default roles initialized');
  }

  /**
   * Add or update a role
   */
  addRole(role: Role): void {
    this.roles.set(role.id, role);
    logger.debug(`[RBACManager] Role added/updated: ${role.name}`);
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Check if user has permission for action on resource
   */
  hasPermission(
    user: UserPrincipal,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'execute'
  ): boolean {
    // Check direct permissions
    if (user.permissions.includes('*') || user.permissions.includes(`${resource}:${action}`)) {
      return true;
    }

    // Check role-based permissions
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      if (this.roleHasPermission(role, resource, action)) {
        return true;
      }
    }

    logger.debug(`[RBACManager] Permission denied: ${user.email} -> ${resource}:${action}`);
    return false;
  }

  /**
   * Check if role has permission
   */
  private roleHasPermission(
    role: Role,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'execute'
  ): boolean {
    // Check inherited roles first
    if (role.inherits) {
      for (const parentId of role.inherits) {
        const parent = this.roles.get(parentId);
        if (parent && this.roleHasPermission(parent, resource, action)) {
          return true;
        }
      }
    }

    // Check role permissions
    for (const perm of role.permissions) {
      if (this.matchesResource(perm.resource, resource) && perm.actions.includes(action)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if permission resource matches requested resource
   */
  private matchesResource(permResource: string, requestedResource: string): boolean {
    // Wildcard match
    if (permResource === '*') return true;

    // Exact match
    if (permResource === requestedResource) return true;

    // Prefix match (e.g., 'agents/*' matches 'agents/hr')
    if (permResource.endsWith('*')) {
      const prefix = permResource.slice(0, -1);
      return requestedResource.startsWith(prefix);
    }

    return false;
  }

  /**
   * Get effective permissions for user
   */
  getEffectivePermissions(user: UserPrincipal): Permission[] {
    const permissions: Permission[] = [];

    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    return permissions;
  }

  /**
   * Validate access to agent
   */
  canAccessAgent(user: UserPrincipal, agentId: string, mode: string): boolean {
    return this.hasPermission(user, `agents/${agentId}`, 'execute') ||
           this.hasPermission(user, 'agents', 'execute');
  }
}
