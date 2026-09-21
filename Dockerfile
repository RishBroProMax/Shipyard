# ============================================================
# Shipyard PaaS — Production Multi-Stage Dockerfile
# Produces a minimal, secure image (~200MB) using Next.js
# standalone output. Node.js 20 Alpine base.
# ============================================================

FROM node:20-alpine AS base
# libc6-compat: required for some native Node.js modules on Alpine
# docker-cli: so the app container can exec Docker commands on the host
RUN apk add --no-cache libc6-compat curl bash openssl docker-cli
WORKDIR /app

# ── Stage 1: Install Dependencies ─────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
# Use npm ci for reproducible installs; ignore-scripts to skip Prisma postinstall
RUN npm ci --ignore-scripts

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Provide a dummy DATABASE_URL so Prisma generate succeeds without a live DB
ENV DATABASE_URL=postgresql://shipyard:secret@localhost:5432/shipyard

# Tell next.config.js to use standalone output (lean bundle for Docker)
ENV SHIPYARD_STANDALONE=1

# Build (safe-build.js runs prisma generate then next build)
RUN npm run build

# ── Stage 3: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache curl bash openssl docker-cli netcat-openbsd

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SHIPYARD_DATA_DIR=/var/lib/shipyard/data

# Create non-root user for security (still needs docker socket access)
RUN addgroup --system --gid 1001 shipyard && \
    adduser --system --uid 1001 --ingroup shipyard shipyard

# Create data directories and set ownership
RUN mkdir -p /var/lib/shipyard/data && \
    chown -R shipyard:shipyard /var/lib/shipyard

# Copy standalone build output (contains only necessary code + node_modules)
COPY --from=builder --chown=shipyard:shipyard /app/.next/standalone ./
COPY --from=builder --chown=shipyard:shipyard /app/.next/static ./.next/static
COPY --from=builder --chown=shipyard:shipyard /app/public ./public

# Copy essential runtime files
COPY --from=builder --chown=shipyard:shipyard /app/prisma ./prisma
COPY --from=builder --chown=shipyard:shipyard /app/src/agent ./src/agent
COPY --from=builder --chown=shipyard:shipyard /app/scripts ./scripts
COPY --from=builder --chown=shipyard:shipyard /app/node_modules ./node_modules
COPY --from=builder --chown=shipyard:shipyard /app/package.json ./package.json

# Shipyard entrypoint: run DB migrations, init supervisor, then start Next.js
COPY --chown=shipyard:shipyard docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# The container needs docker socket access for build orchestration.
# We add shipyard user to docker group via entrypoint runtime.
USER shipyard

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
