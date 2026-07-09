# ==========================
# Stage 1: Build Angular Application
# ==========================
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build


# ==========================
# Stage 2: Nginx Runtime
# ==========================
FROM nginx:1.25-alpine

LABEL maintainer="BoniCare Team"
LABEL description="BoniCare Frontend - Angular 19 with Nginx"

WORKDIR /usr/share/nginx/html


# Angular build
COPY --from=builder /build/dist/bonicare-frontend/browser /usr/share/nginx/html


# Nginx configs
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user


# Permissions for non-root nginx
RUN mkdir -p \
        /var/cache/nginx \
        /var/log/nginx \
        /var/run/nginx \
        /tmp/nginx \
    && chown -R nginx-user:nginx-user \
        /usr/share/nginx/html \
        /var/cache/nginx \
        /var/log/nginx \
        /var/run/nginx \
        /tmp/nginx \
        /etc/nginx/conf.d \
        /etc/nginx/nginx.conf


# Run as non-root
USER nginx-user


EXPOSE 80


HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1


CMD ["nginx", "-g", "daemon off;"]