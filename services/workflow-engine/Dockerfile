# ============================================================================
# BlackSentinel Forge - Workflow Engine Dockerfile
# Multi-stage build for production
# ============================================================================

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/workflow-engine/package.json ./services/workflow-engine/
RUN npm ci --workspace=services/workflow-engine --workspace=packages/shared

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/services/workflow-engine/node_modules ./services/workflow-engine/node_modules
COPY packages/shared ./packages/shared
COPY services/workflow-engine ./services/workflow-engine
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/workflow-engine

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 forge && adduser --system --uid 1001 forge
WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/services/workflow-engine/dist ./services/workflow-engine/dist
COPY --from=builder /app/services/workflow-engine/package.json ./services/workflow-engine/
COPY --from=builder /app/node_modules ./node_modules

USER forge
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "services/workflow-engine/dist/server.js"]
