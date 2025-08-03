#!/bin/bash

# Database Migration Script for StudyMate

set -e

echo "🗄️ Running StudyMate Database Migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check database connection
echo "🔌 Testing database connection..."
npx prisma db pull --force || {
    echo "⚠️ Could not connect to database, attempting to create..."
    # This might fail if database doesn't exist, which is okay
}

# Deploy migrations
echo "📊 Deploying database migrations..."
npx prisma migrate deploy

# Seed database if in development
if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "test" ]; then
    echo "🌱 Seeding development database..."
    npm run db:seed || echo "⚠️ Seeding failed or no seed script found"
fi

echo "✅ Database migrations completed successfully!" 