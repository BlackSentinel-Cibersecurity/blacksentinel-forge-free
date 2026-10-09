// ============================================================================
// BlackSentinel Forge - API Gateway
// ============================================================================

import express from 'express';
import { jwtSecret } from './secret';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { createAuthRoutes } from './routes/auth';
import { createWorkflowRoutes } from './routes/workflows';
import { createExecutionRoutes } from './routes/executions';
import { createConnectorRoutes } from './routes/connectors';
import { createApprovalRoutes } from './routes/approvals';
import { createEventRoutes } from './routes/events';
import { createDashboardRoutes } from './routes/dashboard';
import { createPlaybookRoutes } from './routes/playbooks';
import { createAuditRoutes } from './routes/audit';
import { createSecretsRoutes } from './routes/secrets';
import { createComplianceRoutes } from './routes/compliance';
import { createObservabilityRoutes } from './routes/observability';
import { createTeamRoutes } from './routes/team';
import { createSettingsRoutes } from './routes/settings';
import { createMarketplaceRoutes } from './routes/marketplace';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
import { logger, requestLogger } from './middleware/logger';

export interface GatewayConfig {
  port: number;
  host: string;
  corsOrigins: string[];
  rateLimitWindow: number;
  rateLimitMax: number;
  jwtSecret: string;
}

export function createGateway(config: GatewayConfig): express.Application {
  const app = express();

  // ---------------------------------------------------------------------------
  // Global Middleware
  // ---------------------------------------------------------------------------
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindow,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
    }),
  );

  // Request tracing
  app.use((req, res, next) => {
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    (req as AuthenticatedRequest).traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);
    next();
  });

  // Logging
  app.use(requestLogger);

  // ---------------------------------------------------------------------------
  // Health & Info
  // ---------------------------------------------------------------------------
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'blacksentinel-forge',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/v1/info', (_req, res) => {
    res.json({
      name: 'BlackSentinel Forge',
      version: '0.1.0',
      description: 'Autonomous Security Automation & Orchestration Platform',
      modules: [
        'workflow-engine',
        'connector-service',
        'event-bus',
        'approval-center',
        'observability',
        'playbook-library',
        'automation-marketplace',
      ],
    });
  });

  // ---------------------------------------------------------------------------
  // API Routes
  // ---------------------------------------------------------------------------
  const apiRouter = express.Router();

  // Public routes
  apiRouter.use('/auth', createAuthRoutes());

  // Protected routes
  apiRouter.use(authMiddleware(config.jwtSecret));
  apiRouter.use(tenantMiddleware);

  apiRouter.use('/workflows', createWorkflowRoutes());
  apiRouter.use('/executions', createExecutionRoutes());
  apiRouter.use('/connectors', createConnectorRoutes());
  apiRouter.use('/approvals', createApprovalRoutes());
  apiRouter.use('/events', createEventRoutes());
  apiRouter.use('/dashboard', createDashboardRoutes());
  apiRouter.use('/playbooks', createPlaybookRoutes());
  apiRouter.use('/audit', createAuditRoutes());
  apiRouter.use('/secrets', createSecretsRoutes());
  apiRouter.use('/compliance', createComplianceRoutes());
  apiRouter.use('/observability', createObservabilityRoutes());
  apiRouter.use('/team', createTeamRoutes());
  apiRouter.use('/settings', createSettingsRoutes());
  apiRouter.use('/marketplace', createMarketplaceRoutes());

  app.use('/api/v1', apiRouter);

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------
  app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const traceId = (req as AuthenticatedRequest).traceId || 'unknown';
    logger.error({ err, traceId }, 'Unhandled error');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      },
      timestamp: new Date().toISOString(),
      traceId,
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

// ---------------------------------------------------------------------------
// Server Startup
// ---------------------------------------------------------------------------
if (require.main === module) {
  const config: GatewayConfig = {
    port: parseInt(process.env.PORT || '8080', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
    jwtSecret: jwtSecret((msg) => logger.warn(msg)),
  };

  const app = createGateway(config);

  app.listen(config.port, config.host, () => {
    logger.info(
      { host: config.host, port: config.port },
      'BlackSentinel Forge API Gateway started',
    );
  });
}
