# ============================================================================
# BlackSentinel Forge - API Gateway Dockerfile
# Multi-stage build for production
# ============================================================================

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/api-gateway/package.json ./services/api-gateway/
# --ignore-scripts: the Prisma schema (needed by the postinstall "prisma
# generate" step) doesn't exist in this stage yet, only package.json files do.
RUN npm ci --ignore-scripts --workspace=services/api-gateway --workspace=packages/shared

# ---------------------------------------------------------------------------
# Builder
# ---------------------------------------------------------------------------
FROM base AS builder
# npm workspaces hoists all workspace dependencies into the root
# node_modules — there are no per-workspace node_modules directories to copy.
COPY --from=deps /app/node_modules ./node_modules
# npm needs the root package.json to resolve `--workspace=...` commands.
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY services/api-gateway ./services/api-gateway
RUN npm run build --workspace=packages/shared
RUN npx prisma generate --schema=services/api-gateway/prisma/schema.prisma
RUN npm run build --workspace=services/api-gateway

# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 forge && adduser --system --uid 1001 forge
WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=builder /app/services/api-gateway/package.json ./services/api-gateway/
COPY --from=builder /app/node_modules ./node_modules

USER forge
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "services/api-gateway/dist/index.js"]
