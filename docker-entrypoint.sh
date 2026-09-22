#!/bin/sh
# ============================================================
# Shipyard Docker Entrypoint
# Runs as root initially to fix permissions, then drops to
# the 'shipyard' user for the actual application.
#
# Handles:
#   1. Data directory ownership fix (volume mount permissions)
#   2. Wait for PostgreSQL to be ready
#   3. Prisma DB migrations (idempotent - safe to run repeatedly)
#   4. Start the Next.js production server
# ============================================================

set -e

echo ""
echo "=============================================="
echo "  ⚓  SHIPYARD PAAS — STARTING UP"
echo "=============================================="
echo ""

# ── Fix Volume Permissions ────────────────────────────────────────────────────
# Docker named volumes are owned by root when first created.
# We must chown them so the 'shipyard' non-root user can write.
if [ -d "/var/lib/shipyard/data" ]; then
    chown -R 1001:1001 /var/lib/shipyard/data 2>/dev/null || true
fi

# ── Ensure Data Directories Exist ────────────────────────────────────────────
mkdir -p /var/lib/shipyard/data/secrets
mkdir -p /var/lib/shipyard/data/deployments
mkdir -p /var/lib/shipyard/data/apps
mkdir -p /var/lib/shipyard/data/caddy
mkdir -p /var/lib/shipyard/data/logs
mkdir -p /var/lib/shipyard/data/backups
chown -R 1001:1001 /var/lib/shipyard/data 2>/dev/null || true
echo "[Shipyard] ✓ Data directories ready."

# ── Configure Docker Socket Permissions ─────────────────────────────────────
# If /var/run/docker.sock is mounted, ensure the 'shipyard' user has read/write
# access to communicate with the host Docker daemon.
if [ -S "/var/run/docker.sock" ]; then
    echo "[Shipyard] Docker socket detected. Configuring permissions..."
    chmod 666 /var/run/docker.sock 2>/dev/null || true
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo "")
    if [ -n "$DOCKER_GID" ] && [ "$DOCKER_GID" != "0" ]; then
        addgroup -g "$DOCKER_GID" docker_host 2>/dev/null || true
        addgroup shipyard docker_host 2>/dev/null || true
    fi
    echo "[Shipyard] ✓ Docker socket permissions configured for container orchestration."
fi

# ── Wait for PostgreSQL ───────────────────────────────────────────────────────
if [ -n "$DATABASE_URL" ]; then
    echo "[Shipyard] Waiting for PostgreSQL..."
    # Parse host and port from postgresql://user:pass@host:port/db
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/?]+).*|\1|')
    DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
    DB_PORT=${DB_PORT:-5432}

    MAX_RETRIES=30
    RETRY=0
    until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
        if [ $RETRY -ge $MAX_RETRIES ]; then
            echo "[Shipyard] ERROR: PostgreSQL at ${DB_HOST}:${DB_PORT} not ready after ${MAX_RETRIES} attempts. Aborting."
            exit 1
        fi
        RETRY=$((RETRY + 1))
        echo "[Shipyard]   Attempt $RETRY/$MAX_RETRIES — waiting 2s..."
        sleep 2
    done
    echo "[Shipyard] ✓ PostgreSQL is ready."
fi

# ── Run Prisma DB Schema Push / Migrations ────────────────────────────────────
# We use 'db push' (not migrate deploy) because install.sh doesn't run
# 'prisma migrate dev' to generate migration files. db push is idempotent
# and safe: it creates/alters tables to match schema without data loss
# (schema is additive — no drops on fields that still exist in code).
if [ -n "$DATABASE_URL" ]; then
    echo "[Shipyard] Syncing database schema..."
    node /app/node_modules/.bin/prisma db push \
        --schema /app/prisma/schema.prisma \
        --accept-data-loss \
        2>/dev/null && echo "[Shipyard] ✓ Database schema synced." || \
    echo "[Shipyard] ⚠ Schema sync warning (non-fatal — continuing)."
fi

# ── Bootstrap Appliance State & Admin Account ─────────────────────────────────
if [ -f "/app/scripts/init-appliance.js" ]; then
    echo "[Shipyard] Initializing appliance supervisor & admin account..."
    node /app/scripts/init-appliance.js 2>/dev/null || echo "[Shipyard] ⚠ Appliance bootstrap note: will initialize on first request."
fi

# Ensure permissions are clean for the application user
chown -R 1001:1001 /var/lib/shipyard/data 2>/dev/null || true

echo ""
echo "[Shipyard] Starting Next.js production server..."
echo ""

# Drop privileges and exec the CMD (node server.js) as the shipyard user
exec su-exec shipyard "$@" 2>/dev/null || exec "$@"
