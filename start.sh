#!/bin/sh
set -e
# Write DATABASE_URL to .env so Prisma CLI can read it
echo "DATABASE_URL=$DATABASE_URL" > /app/.env
# Create database tables
npx prisma db push --skip-generate
# Start the app
exec node_modules/.bin/next start -H 0.0.0.0 -p 3000
