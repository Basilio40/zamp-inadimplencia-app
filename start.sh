#!/bin/sh
set -e

# Run database migrations before starting the server
npx prisma migrate deploy

# Start the Next.js standalone server, bound to all interfaces on the Railway port
HOST=0.0.0.0 PORT=${PORT:-8080} node .next/standalone/server.js
