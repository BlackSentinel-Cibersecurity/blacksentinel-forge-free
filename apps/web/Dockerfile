# ============================================================================
# BlackSentinel Forge - Frontend Dockerfile
# Multi-stage build for Next.js
# ============================================================================

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
RUN npm ci --workspace=apps/web --workspace=packages/shared

FROM base AS builder
# npm workspaces hoists all workspace dependencies into the root
# node_modules — there are no per-workspace node_modules directories to copy.
COPY --from=deps /app/node_modules ./node_modules
# npm needs the root package.json to resolve `--workspace=...` commands.
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 forge && adduser --system --uid 1001 forge
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

USER forge
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
