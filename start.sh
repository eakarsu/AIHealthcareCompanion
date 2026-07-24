#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; cd "$ROOT"; if [ ! -f .env ]; then echo "Missing .env; copy .env.example." >&2; exit 1; fi
set -a
# shellcheck disable=SC1091
source .env
set +a
if [ -z "${JWT_SECRET:-}" ] && ! grep -Eq '^JWT_SECRET=.{32,}$' .env; then echo "JWT_SECRET must contain at least 32 characters." >&2; exit 1; fi
if [ -n "${JWT_SECRET:-}" ] && [ "${#JWT_SECRET}" -lt 32 ]; then echo "JWT_SECRET must contain at least 32 characters." >&2; exit 1; fi
if [ -z "${DATABASE_URL:-}" ] && ! grep -Eq '^DATABASE_URL=.+' .env; then echo "DATABASE_URL is required." >&2; exit 1; fi
if [ ! -d node_modules ] || [ ! -d client/node_modules ]; then echo "Run scripts/bootstrap.sh explicitly." >&2; exit 1; fi
BACKEND_PORT="${BACKEND_PORT:-${PORT:-3001}}"; FRONTEND_PORT="${FRONTEND_PORT:-5173}"; [ "$BACKEND_PORT" != "$FRONTEND_PORT" ] || { echo "Backend and frontend ports must differ." >&2; exit 1; }; for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do if command -v lsof >/dev/null && lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is in use." >&2; exit 1; fi; done
if [ "${MIGRATE_ON_START:-false}" = "true" ]; then npx prisma db push --skip-generate; node server/scripts/runtime-init.js; fi
PORT="$BACKEND_PORT" node server/index.js & B=$!; (cd client && npm run dev -- --host "${FRONTEND_HOST:-127.0.0.1}" --port "$FRONTEND_PORT" --strictPort) & F=$!; cleanup(){ kill "$B" "$F" 2>/dev/null || true; wait "$B" "$F" 2>/dev/null || true; }; trap cleanup EXIT INT TERM; wait "$B" "$F"
