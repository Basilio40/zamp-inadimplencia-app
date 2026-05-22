#!/bin/sh
set -e

# Run database migrations before starting the server
npx prisma migrate deploy

# Start the Next.js standalone server, bound to all interfaces on port 8080
HOST=0.0.0.0 PORT=8080 node .next/standalone/server.js
