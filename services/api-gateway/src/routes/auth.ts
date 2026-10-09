// ============================================================================
// BlackSentinel Forge - Auth Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { generateToken } from '../middleware/auth';
import { Permission } from '@blacksentinel/shared';
import { z } from 'zod';
import { timingSafeEqual } from 'crypto';
import { jwtSecret } from '../secret';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = LoginSchema.parse(req.body);

    // SECURITY FIX: this accepted ANY email and password and returned an admin
    // token. The open-source edition has one operator account, set in .env
    // (scripts/init-env.sh creates ADMIN_PASSWORD).
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@blacksentinel.local').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!adminPassword || adminPassword.length < 12) {
      res.status(503).json({
        success: false,
        error: { code: 'LOGIN_NOT_CONFIGURED', message: 'Set ADMIN_PASSWORD (12+ characters) in .env; scripts/init-env.sh creates one.' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    const given = Buffer.from(body.password);
    const expected = Buffer.from(adminPassword);
    const valid =
      body.email.trim().toLowerCase() === adminEmail &&
      given.length === expected.length &&
      timingSafeEqual(given, expected);
    if (!valid) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const mockUser = {
      id: 'usr_admin',
      email: adminEmail,
      name: 'Security Analyst',
      role: 'admin' as const,
      permissions: [
        { resource: 'workflows', actions: ['read', 'write', 'execute', 'delete'] },
        { resource: 'executions', actions: ['read', 'execute'] },
        { resource: 'connectors', actions: ['read', 'write'] },
      ] as Permission[],
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: 'tenant_default',
      status: 'active' as const,
    };

    const token = generateToken(mockUser, jwtSecret());

    res.json({
      success: true,
      data: {
        user: mockUser,
        token,
        expiresIn: '8h',
      },
      timestamp: new Date().toISOString(),
      traceId: req.headers['x-trace-id'] as string || 'unknown',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'LOGIN_FAILED', message: 'Authentication failed' },
        timestamp: new Date().toISOString(),
      });
    }
  }
});

// POST /auth/register
// SECURITY FIX: self-registration handed anyone an admin token with '*'
// permissions and stored nothing. The open-source edition has one operator
// account (ADMIN_EMAIL / ADMIN_PASSWORD in .env), so registration is off.
router.post('/register', (_req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: { code: 'REGISTRATION_DISABLED', message: 'Self-registration is not available in the open-source edition.' },
    timestamp: new Date().toISOString(),
  });
});

// POST /auth/refresh
// This returned the literal string 'new_token' as if it were a session. Token
// refresh is not implemented in the open-source edition: sign in again.
router.post('/refresh', (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: { code: 'REFRESH_NOT_AVAILABLE', message: 'Tokens last 8 hours; sign in again to get a new one.' },
    timestamp: new Date().toISOString(),
  });
});

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
    timestamp: new Date().toISOString(),
  });
});

export function createAuthRoutes(): Router {
  return router;
}
