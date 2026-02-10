/**
 * Authentication and Authorization Types
 */

export interface UserPrincipal {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  groups: string[];
  department?: string;
  permissions: string[];
  metadata: Record<string, unknown>;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserPrincipal;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
  value: unknown;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[];
}
