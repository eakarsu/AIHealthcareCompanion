#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; npx --prefix "$ROOT" prisma migrate deploy
