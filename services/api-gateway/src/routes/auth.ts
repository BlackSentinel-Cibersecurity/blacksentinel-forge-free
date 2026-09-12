// ============================================================================
// BlackSentinel Forge - Auth Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { generateToken, hashPassword, verifyPassword } from '../middleware/auth';
import { Permission } from '@blacksentinel/shared';
import { z } from 'zod';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  tenantName: z.string().min(2),
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = LoginSchema.parse(req.body);

    // In production: query database
    const mockUser = {
      id: 'usr_' + Date.now(),
      email: body.email,
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

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const token = generateToken(mockUser, jwtSecret);

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
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = RegisterSchema.parse(req.body);
    const hashedPassword = await hashPassword(body.password);

    // In production: create tenant + user in database
    const mockUser = {
      id: 'usr_' + Date.now(),
      email: body.email,
      name: body.name,
      role: 'admin' as const,
      permissions: [
        { resource: '*', actions: ['read', 'write', 'execute', 'delete', 'approve'] },
      ] as Permission[],
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: 'tenant_' + Date.now(),
      status: 'active' as const,
    };

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const token = generateToken(mockUser, jwtSecret);

    res.status(201).json({
      success: true,
      data: { user: mockUser, token, tenantName: body.tenantName },
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
        error: { code: 'REGISTRATION_FAILED', message: 'Registration failed' },
        timestamp: new Date().toISOString(),
      });
    }
  }
});

// POST /auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  // In production: validate refresh token
  res.json({
    success: true,
    data: { token: 'new_token', expiresIn: '8h' },
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
