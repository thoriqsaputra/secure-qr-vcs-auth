#!/bin/sh
set -e

echo "Running migrations..."
uv run python migrate.py

echo "Starting API..."
exec uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
