// ============================================================================
// BlackSentinel Forge - Authentication Middleware (Zero Trust)
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Permission } from '@blacksentinel/shared';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tenantId?: string;
  traceId?: string;
  permissions?: Permission[];
}

interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export function authMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
      });
      return;
    }

    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      (req as AuthenticatedRequest).user = {
        id: decoded.userId,
        email: decoded.email,
        name: '',
        role: decoded.role as User['role'],
        permissions: decoded.permissions,
        mfaEnabled: false,
        createdAt: '',
        updatedAt: '',
        tenantId: decoded.tenantId,
        status: 'active',
      };
      (req as AuthenticatedRequest).tenantId = decoded.tenantId;
      (req as AuthenticatedRequest).permissions = decoded.permissions;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
        });
      } else {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid token' },
        });
      }
    }
  };
}

export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const permissions = authReq.permissions || [];

    const hasPermission = permissions.some(
      (p) =>
        p.resource === resource &&
        (p.actions.includes(action as 'read' | 'write' | 'execute' | 'delete' | 'approve') ||
          p.actions.includes('*' as never)),
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions: ${action} on ${resource}`,
        },
      });
      return;
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Required role: ${roles.join(' or ')}`,
        },
      });
      return;
    }

    next();
  };
}

export function requireMFA(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;

  if (authReq.user?.mfaEnabled && !req.headers['x-mfa-verified']) {
    res.status(403).json({
      success: false,
      error: { code: 'MFA_REQUIRED', message: 'Multi-factor authentication required' },
    });
    return;
  }

  next();
}

// Token generation
export function generateToken(
  user: User,
  jwtSecret: string,
  expiresIn: SignOptions['expiresIn'] = '8h',
): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
