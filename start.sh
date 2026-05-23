#!/bin/sh
set -e

# Run database migrations before starting the server
npx prisma migrate deploy

# Seed default users (safe to run multiple times thanks to upsert)
npx tsx prisma/seed-users.ts

# Start the Next.js server on the Railway port, binding to all interfaces
HOSTNAME=0.0.0.0 next start -p "${PORT:-3000}"
