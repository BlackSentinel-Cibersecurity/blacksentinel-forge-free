// ============================================================================
// BlackSentinel Forge - Workflow Engine: standalone service entrypoint
//
// index.ts only exports the WorkflowEngine class — nothing in this package
// ever started an HTTP listener or a queue-consumption loop, yet its
// Dockerfile (EXPOSE 8081, CMD node dist/index.js) and docker-compose entry
// (DATABASE_URL, REDIS_URL, restart: unless-stopped) both assume it runs as
// its own long-lived container. Without a listener the process runs to
// completion and exits immediately — Docker's restart policy would crash-
// loop it forever. This file is the missing entrypoint.
//
// Honest scope: this wires up the class that already exists and gives it a
// real, working health endpoint so the container actually stays up and is
// checkable. It does NOT add Postgres persistence or a Redis-backed queue —
// WorkflowQueue (./queue) is in-memory only today despite bullmq/ioredis
// being listed as dependencies. Wiring those is a real product feature gap,
// not a deployment-config fix, and needs the original design intent (retry
// semantics, persistence schema) rather than an invented guess.
// ============================================================================

import { createServer } from 'http';
import { WorkflowEngine, type EngineConfig } from './engine';

const PORT = Number(process.env.PORT ?? 8081);

const config: EngineConfig = {
  maxConcurrentExecutions: Number(process.env.MAX_CONCURRENT_EXECUTIONS ?? 50),
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 30_000),
  maxRetries: Number(process.env.MAX_RETRIES ?? 3),
  backoffMs: Number(process.env.BACKOFF_MS ?? 1_000),
  backoffMultiplier: Number(process.env.BACKOFF_MULTIPLIER ?? 2),
};

const engine = new WorkflowEngine(config);
const startedAt = new Date().toISOString();

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'workflow-engine', startedAt }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[workflow-engine] listening on :${PORT} (config: ${JSON.stringify(config)})`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

export { engine };
