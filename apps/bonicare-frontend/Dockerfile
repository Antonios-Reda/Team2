# =============================================================================
# Stage 1 - Build Angular Application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy dependency manifests first for Docker layer caching
COPY package*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci; \
    else \
        npm install; \
    fi && \
    npm cache clean --force

# Copy source
COPY . .

# -------- Temporary Debug (Remove after fixing Jenkins) --------
RUN node --version && \
    npm --version && \
    ls -la && \
    ls -la node_modules && \
    ls -la node_modules/.bin && \
    npm ls @angular/cli && \
    npx ng version

# Build Angular
RUN npm run build


# =============================================================================
# Stage 2 - Runtime
# =============================================================================
FROM nginx:1.25-alpine

LABEL maintainer="BoniCare Team" \
      description="BoniCare Frontend - Angular 19"

WORKDIR /usr/share/nginx/html

# Create non-root user, required directories and permissions in one layer
RUN addgroup -S -g 1001 nginx-user && \
    adduser -S -u 1001 -G nginx-user nginx-user && \
    mkdir -p \
        /var/cache/nginx \
        /var/log/nginx \
        /var/run/nginx \
        /tmp/nginx

# Copy Angular build
COPY --from=builder /build/dist/bonicare-frontend/browser ./

# Copy nginx configuration
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chown -R nginx-user:nginx-user \
        /usr/share/nginx/html \
        /var/cache/nginx \
        /var/log/nginx \
        /var/run/nginx \
        /tmp/nginx \
        /etc/nginx

USER nginx-user

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]