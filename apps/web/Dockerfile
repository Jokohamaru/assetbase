# syntax=docker/dockerfile:1.7
FROM --platform=$BUILDPLATFORM node:22-alpine AS build

ARG APP_VERSION=development
WORKDIR /app

# Copy lockfiles và package.json từng package để tối ưu layer cache
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

# Tận dụng cache mount để không phải tải lại node_modules từ đầu
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci

# Copy mã nguồn frontend
COPY apps/web ./apps/web

# Đóng gói biến môi trường Vite vào static bundle lúc build
ARG VITE_API_URL=/api/v1
ARG VITE_DEMO_MODE=false
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_DEMO_MODE=${VITE_DEMO_MODE}

RUN npm run build --workspace @assetflow/web

# Stage Runtime: Nginx unprivileged chạy cổng 8080 với user non-root (UID 101)
FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1