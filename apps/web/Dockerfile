# syntax=docker/dockerfile:1.7
FROM --platform=$BUILDPLATFORM node:22-alpine AS build

ARG APP_VERSION=development
WORKDIR /app

# Copy package.json và package-lock.json của frontend
COPY package.json package-lock.json ./

# Tận dụng cache mount để cài đặt npm packages
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci

# Copy toàn bộ mã nguồn frontend
COPY . .

# Đóng gói biến môi trường Vite vào static bundle lúc build
ARG VITE_API_URL=/api/v1
ARG VITE_DEMO_MODE=false
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_DEMO_MODE=${VITE_DEMO_MODE}

# Build static bundle với Vite directly
RUN npx vite build

# Stage Runtime: Nginx unprivileged
FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1