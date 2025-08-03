#!/bin/bash

# StudyMate Backend Startup Script

set -e

echo "🚀 Starting StudyMate Backend..."

# Check if we're in development or production
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Production mode detected"
    
    # Wait for database to be ready
    echo "⏳ Waiting for database connection..."
    npx wait-port $DATABASE_HOST:5432 -t 30000
    
    # Run database migrations
    echo "🗄️ Running database migrations..."
    npm run db:migrate
    
    # Generate Prisma client (in case it's needed)
    echo "🔧 Generating Prisma client..."
    npm run db:generate
    
    # Start the production server
    echo "✅ Starting production server..."
    exec node dist/index.js
else
    echo "🛠️ Development mode detected"
    
    # Install dependencies if node_modules is empty
    if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
        echo "📦 Installing dependencies..."
        npm ci
    fi
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npm run db:generate
    
    # Wait for database
    echo "⏳ Waiting for database connection..."
    npx wait-port ${DATABASE_URL#*@} -t 30000 || echo "⚠️ Database not ready, continuing anyway..."
    
    # Run migrations in development
    echo "🗄️ Running database migrations..."
    npm run db:migrate || echo "⚠️ Migration failed, continuing anyway..."
    
    # Start development server with auto-reload
    echo "✅ Starting development server..."
    exec npm run dev
fi 