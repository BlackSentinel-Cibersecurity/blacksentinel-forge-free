import { Request, Response, NextFunction } from 'express';
import { generateId } from '@blacksentinel/shared';

export interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
}

export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction): void {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || (req as any).user?.tenantId;
    const userId = req.headers['x-user-id'] as string || (req as any).user?.id;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: 'Tenant ID is required. Provide x-tenant-id header.',
        timestamp: new Date().toISOString(),
        traceId: generateId(),
      });
      return;
    }

    req.tenantId = tenantId;
    req.userId = userId;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to extract tenant information',
      timestamp: new Date().toISOString(),
      traceId: generateId(),
    });
  }
}
