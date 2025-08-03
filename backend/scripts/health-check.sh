#!/bin/bash

# Health Check Script for StudyMate Backend

set -e

PORT=${PORT:-3001}
HOST=${HOST:-localhost}

# Check if the server is responding
echo "🔍 Checking backend health at http://$HOST:$PORT/health"

# Make HTTP request to health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" http://$HOST:$PORT/health || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Backend is healthy (HTTP $response)"
    exit 0
else
    echo "❌ Backend is unhealthy (HTTP $response)"
    exit 1
fi 