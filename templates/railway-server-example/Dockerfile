# syntax=docker/dockerfile:1.7
#
# Standalone Dockerfile for the tldraw railway-server-example.
# Build from the template directory (not the monorepo root).
#
#   docker build -t tldraw-server .
#

# ============================================================================
# Builder: install deps, bundle server (esbuild), build client (Vite)
# ============================================================================
FROM node:22-bookworm-slim AS builder

# Build tools for native modules (better-sqlite3, sharp, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Ensure esbuild and vite are available
RUN npx esbuild --version && npx vite --version

# Bundle the server with esbuild (better-sqlite3 external for native binding)
RUN npx esbuild src/server/server.ts \
    --bundle --platform=node --format=cjs --target=node22 \
    --outfile=dist/server.cjs --external:better-sqlite3 --sourcemap

# Build the Vite client. A tldraw license key is required for production deployments.
# Set VITE_TLDRAW_LICENSE_KEY as a Railway environment variable (or Docker build arg).
ARG VITE_TLDRAW_LICENSE_KEY
ENV VITE_TLDRAW_LICENSE_KEY=$VITE_TLDRAW_LICENSE_KEY
RUN npx vite build

# ============================================================================
# Runtime: only what's needed at runtime
# ============================================================================
FROM node:22-bookworm-slim AS runtime

# tini for proper SIGTERM handling; ca-certificates for unfurl fetches.
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bundled server + Vite client output.
COPY --from=builder /app/dist ./dist

# Install only production dependencies (better-sqlite3 needs native binding)
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install --omit=dev --ignore-scripts && npm rebuild better-sqlite3

# Persistence: mount a Railway volume at /data so rooms and uploaded assets
# survive redeploys. Without it, the filesystem is ephemeral.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
ENV CLIENT_DIST=/app/dist/client
ENV ROOMS_DIR=/data/rooms
ENV ASSETS_DIR=/data/assets

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/server.cjs"]
