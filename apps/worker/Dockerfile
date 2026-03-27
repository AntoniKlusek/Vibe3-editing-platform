# =============================================================================
# Stage 1 — Builder: compile TypeScript
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy everything
COPY . .

# Install dependencies (development and production)
RUN pnpm install

# Create temp directory for FFmpeg output
RUN mkdir -p /tmp/Vibe3 && chmod 777 /tmp/Vibe3

# Health check (port 3001)
# Note: we use tsx so it might take a bit longer to start
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

EXPOSE 3001

# Run the worker using tsx directly on the source files
# This is much more reliable for monorepo development
CMD ["pnpm", "--filter", "@vibe3/worker", "run", "dev"]
