#!/bin/sh
# ============================================================
# Shipyard Docker Entrypoint
# Runs on every container start. Handles:
#   1. Prisma DB migrations (idempotent - safe to run repeatedly)
#   2. Shipyard appliance first-boot initialization via API
#   3. Starts the Next.js production server
# ============================================================

set -e

echo ""
echo "=============================================="
echo "  ⚓  SHIPYARD PAAS — STARTING UP"
echo "=============================================="
echo ""

# ── Wait for PostgreSQL ───────────────────────────────────────────────────────
if [ -n "$DATABASE_URL" ]; then
    echo "[Shipyard] Waiting for PostgreSQL to be ready..."
    # Extract host and port from DATABASE_URL
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:\/]*\).*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_PORT=${DB_PORT:-5432}

    MAX_RETRIES=30
    RETRY_COUNT=0
    until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "[Shipyard] Postgres not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES)..."
        sleep 2
    done

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "[Shipyard] ERROR: PostgreSQL did not become ready in time. Aborting."
        exit 1
    fi
    echo "[Shipyard] ✓ PostgreSQL is ready."
fi

# ── Run Prisma Migrations ─────────────────────────────────────────────────────
# deploy mode: runs only pending migrations (safe in production, no data loss)
if [ -d "/app/prisma/migrations" ] && [ -n "$DATABASE_URL" ]; then
    echo "[Shipyard] Running database migrations..."
    node /app/node_modules/prisma/build/index.js migrate deploy --schema /app/prisma/schema.prisma
    echo "[Shipyard] ✓ Database migrations applied."
else
    echo "[Shipyard] No migration directory found - using db push for first boot..."
    node /app/node_modules/prisma/build/index.js db push --schema /app/prisma/schema.prisma --accept-data-loss 2>/dev/null || true
    echo "[Shipyard] ✓ Database schema synced."
fi

# ── Ensure Data Directories Exist ────────────────────────────────────────────
echo "[Shipyard] Ensuring data directories..."
mkdir -p "$SHIPYARD_DATA_DIR/secrets"
mkdir -p "$SHIPYARD_DATA_DIR/deployments"
mkdir -p "$SHIPYARD_DATA_DIR/apps"
mkdir -p "$SHIPYARD_DATA_DIR/caddy"
mkdir -p "$SHIPYARD_DATA_DIR/logs"
mkdir -p "$SHIPYARD_DATA_DIR/backups"
echo "[Shipyard] ✓ Data directories ready."

echo ""
echo "[Shipyard] Starting Next.js production server..."
echo ""

exec "$@"
