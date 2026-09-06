#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8080}"

echo "[1/4] Gateway"
curl -fsS "${BASE_URL}/docker-health"

echo "[2/4] Backend health"
health="$(curl -fsS "${BASE_URL}/api/health")"
printf '%s\n' "$health"
printf '%s' "$health" | grep -q '"mode":"MODEL_READY"' || {
  echo "Le backend n'est pas en MODEL_READY." >&2
  exit 1
}

echo "[3/4] Feature Builder"
features="$(curl -fsS "${BASE_URL}/api/features/ANTANANARIVO")"
printf '%s' "$features" | grep -q '"feature_count":47' || {
  echo "Le Feature Builder ne renvoie pas 47 variables." >&2
  exit 1
}

echo "[4/4] Frontend"
curl -fsS -o /dev/null "${BASE_URL}/dashboard"

echo "OK : Docker + Nginx + FastAPI + modèles + Feature Builder + frontend répondent."
