#!/usr/bin/env bash
# start.sh — Launch MAB Pirates tournament server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Optional: set mentor password via environment
export MENTOR_PASSWORD="${MENTOR_PASSWORD:-pirates2025}"
export PORT="${PORT:-8000}"

echo ""
echo "  ⚓  MAB Pirates — Tournament Platform"
echo "  ─────────────────────────────────────"
echo "  Student site : http://localhost:$PORT"
echo "  Mentor panel : http://localhost:$PORT/mentor"
echo "  Mentor pass  : $MENTOR_PASSWORD"
echo ""

cd backend
exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
