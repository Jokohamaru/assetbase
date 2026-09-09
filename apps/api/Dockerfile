# Stage 1: Build binary
FROM golang:alpine AS builder

ENV GOTOOLCHAIN=auto

# Cài đặt thư viện phụ trợ build
RUN apk add --no-cache git ca-certificates openssl

WORKDIR /app

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy mã nguồn
COPY . .

# Xóa các file Prisma cũ được copy từ máy local nếu có
RUN rm -rf prisma/db

# Generate Prisma Client Go code tương thích với Linux Alpine
RUN go run github.com/steebchen/prisma-client-go generate

# Build static binary với cờ -p 1 (đơn tiến trình) để tiết kiệm bộ nhớ RAM, tránh bị OOM (signal killed)
RUN CGO_ENABLED=0 GOOS=linux go build -p 1 -ldflags="-s -w" -o server ./cmd/server

# Stage 2: Minimal Runtime
FROM debian:bookworm-slim AS runner

RUN apt-get update && apt-get install -y ca-certificates openssl tzdata && rm -rf /var/lib/apt/lists/*

# Tạo user & group bảo mật
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy binary và prisma schema
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma

# Chuẩn bị folder upload và phân quyền
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

ENV PORT=8080 \
    GIN_MODE=release

EXPOSE 8080

CMD ["/app/server"]