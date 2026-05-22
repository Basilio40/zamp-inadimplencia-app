#!/bin/sh
set -e

# Run database migrations before starting the server
npx prisma migrate deploy

# Start the Next.js server on the Railway port
next start -p "${PORT:-3000}"
