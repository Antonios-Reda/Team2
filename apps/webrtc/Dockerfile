# ==========================
# Stage 1: Builder
# ==========================
# Install dependencies (production only)
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
# --omit=dev excludes devDependencies (~40-50% size reduction)
# BuildKit cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy application source code
COPY . .

# ==========================
# Stage 2: Runtime
# ==========================
# Minimal runtime image - production dependencies only
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    WEBRTC_PORT=5002

# Create non-root user for security
# uid:gid 1001 is commonly used in containers
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Copy pre-compiled modules and application code from builder
# --chown ensures appuser owns the files
COPY --from=builder --chown=appuser:appuser /build/node_modules ./node_modules
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose WebRTC signaling server port
EXPOSE 5002

# Health check endpoint
# Interval: 30s, Timeout: 10s, Start period: 5s, Retries: 3
# Checks if /health endpoint returns 200 status
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start WebRTC signaling server
CMD ["npm", "start"]