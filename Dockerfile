# ============================================================
# Shipyard PaaS — Production Multi-Stage Dockerfile
# Produces a minimal, secure image using Next.js standalone
# output. Node.js 20 Alpine base.
#
# Build for Docker/VPS:
#   SHIPYARD_STANDALONE=1 npm run build   (or via docker compose build)
# ============================================================

FROM node:20-alpine AS base
# libc6-compat: required for some native Node.js modules on Alpine
# docker-cli: allows the app to run Docker commands on the host via socket
RUN apk add --no-cache libc6-compat curl bash openssl docker-cli
WORKDIR /app

# ── Stage 1: Install Dependencies ─────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
# npm ci: reproducible, locked installs. ignore-scripts: skip Prisma postinstall
RUN npm ci --ignore-scripts

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Dummy DATABASE_URL: Prisma generate needs a URL format but does NOT connect
ENV DATABASE_URL=postgresql://shipyard:secret@localhost:5432/shipyard
# Tell next.config.js to use output: 'standalone' for a lean bundle
ENV SHIPYARD_STANDALONE=1

# Runs: prisma generate → next build (standalone output)
RUN npm run build

# ── Stage 3: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

# su-exec: minimal privilege drop tool for Alpine (replaces gosu)
# netcat-openbsd: nc command used in entrypoint to wait for Postgres
RUN apk add --no-cache curl bash openssl docker-cli netcat-openbsd su-exec

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SHIPYARD_DATA_DIR=/var/lib/shipyard/data

# Create the non-root shipyard user (UID 1001)
RUN addgroup --system --gid 1001 shipyard && \
    adduser --system --uid 1001 --ingroup shipyard --no-create-home shipyard

# Create data directory (entrypoint will chown at runtime)
RUN mkdir -p /var/lib/shipyard/data

# ── Copy standalone Next.js build ─────────────────────────────────────────────
# standalone/: minimal self-contained server (no full node_modules needed)
COPY --from=builder /app/.next/standalone ./
# Static assets (JS, CSS, images served by Next.js)
COPY --from=builder /app/.next/static ./.next/static
# Public assets (favicon, robots.txt, etc.)
COPY --from=builder /app/public ./public

# ── Copy runtime-only files ───────────────────────────────────────────────────
# Prisma schema: needed for 'db push' in entrypoint
COPY --from=builder /app/prisma ./prisma
# Prisma CLI binary (used in entrypoint for db push)
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Worker node agent script (served at /api/agent/script)
COPY --from=builder /app/src/agent ./src/agent
# Installer scripts (served at /install.sh, /agent_install)
COPY --from=builder /app/install.sh ./install.sh
COPY --from=builder /app/scripts ./scripts

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Entrypoint runs as root (to fix volume permissions and run DB migrations)
# then drops to the 'shipyard' user via su-exec before starting Next.js.
# See docker-entrypoint.sh for details.
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
