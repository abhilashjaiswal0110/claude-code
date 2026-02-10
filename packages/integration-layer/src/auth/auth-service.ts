/**
 * Authentication Service
 *
 * Handles JWT token validation, user authentication,
 * and integration with identity providers.
 *
 * PLACEHOLDER: Configure JWT_SECRET, ISSUER, AUDIENCE
 * environment variables for production deployment.
 */

import jwt from 'jsonwebtoken';
import { logger } from '../monitoring/logger.js';
import type { UserPrincipal, TokenPayload, AuthResult } from './types.js';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly tokenExpiry: string;

  constructor(config?: {
    jwtSecret?: string;
    issuer?: string;
    audience?: string;
    tokenExpiry?: string;
  }) {
    this.jwtSecret = config?.jwtSecret ?? process.env.JWT_SECRET ?? 'PLACEHOLDER_SECRET_CHANGE_IN_PRODUCTION';
    this.issuer = config?.issuer ?? process.env.JWT_ISSUER ?? 'enterprise-agents';
    this.audience = config?.audience ?? process.env.JWT_AUDIENCE ?? 'enterprise-agents-api';
    this.tokenExpiry = config?.tokenExpiry ?? process.env.JWT_EXPIRY ?? '1h';

    if (this.jwtSecret.includes('PLACEHOLDER')) {
      logger.warn('[AuthService] Using placeholder JWT secret - configure JWT_SECRET for production');
    }
  }

  /**
   * Validate JWT token and extract user principal
   */
  async validateToken(token: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: this.issuer,
        audience: this.audience,
      }) as TokenPayload;

      const user: UserPrincipal = {
        id: decoded.sub,
        email: decoded.email,
        displayName: decoded.name,
        roles: decoded.roles,
        groups: [],
        permissions: this.resolvePermissions(decoded.roles),
        metadata: {},
      };

      logger.debug(`[AuthService] Token validated for user: ${user.email}`);

      return {
        success: true,
        user,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token validation failed';
      logger.warn(`[AuthService] Token validation failed: ${message}`);

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Generate JWT token for user
   */
  async generateToken(user: UserPrincipal): Promise<AuthResult> {
    try {
      const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        sub: user.id,
        email: user.email,
        name: user.displayName,
        roles: user.roles,
        iss: this.issuer,
        aud: this.audience,
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.tokenExpiry,
      });

      const decoded = jwt.decode(token) as TokenPayload;
      const expiresIn = decoded.exp - decoded.iat;

      logger.info(`[AuthService] Token generated for user: ${user.email}`);

      return {
        success: true,
        user,
        token,
        expiresIn,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token generation failed';
      logger.error(`[AuthService] Token generation failed: ${message}`);

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Authenticate user with username/password
   *
   * PLACEHOLDER: Implement actual authentication against
   * identity provider (Azure AD, Okta, etc.)
   */
  async authenticate(username: string, _password: string): Promise<AuthResult> {
    // PLACEHOLDER: Implement actual authentication
    // In production, integrate with Azure AD, Okta, LDAP, etc.

    logger.info(`[AuthService] Authentication attempt for: ${username}`);

    // Demo user for POC - replace with actual authentication
    const demoUser: UserPrincipal = {
      id: 'demo-user-001',
      email: username,
      displayName: 'Demo User',
      roles: ['user', 'agent-user'],
      groups: ['enterprise-agents-users'],
      permissions: ['agents:read', 'agents:execute', 'sessions:create'],
      metadata: {
        department: 'IT',
        location: 'Global',
      },
    };

    return this.generateToken(demoUser);
  }

  /**
   * Refresh expired token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    // PLACEHOLDER: Implement refresh token logic
    // In production, validate refresh token and issue new access token

    logger.info('[AuthService] Token refresh requested');

    return {
      success: false,
      error: 'Refresh token not implemented - configure identity provider',
    };
  }

  /**
   * Resolve permissions from roles
   */
  private resolvePermissions(roles: string[]): string[] {
    // PLACEHOLDER: Load from database or configuration
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      'agent-admin': ['agents:*', 'sessions:*', 'config:*'],
      'agent-user': ['agents:read', 'agents:execute', 'sessions:create', 'sessions:read'],
      user: ['agents:read'],
    };

    const permissions = new Set<string>();
    for (const role of roles) {
      const perms = rolePermissions[role] ?? [];
      perms.forEach((p) => permissions.add(p));
    }

    return Array.from(permissions);
  }
}
