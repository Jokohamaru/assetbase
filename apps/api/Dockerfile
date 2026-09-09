# Stage 1: Build binary
FROM golang:1.26-alpine3.20 AS builder

ENV GOTOOLCHAIN=auto

# Không dùng || true để đảm bảo không bỏ qua lỗi mạng
RUN apk add --no-cache git ca-certificates openssl

WORKDIR /app

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy schema trước để generate code (tận dụng cache nếu code go thay đổi mà schema không đổi)
COPY prisma ./prisma
RUN go run github.com/steebchen/prisma-client-go generate

# Copy toàn bộ mã nguồn còn lại
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# Stage 2: Minimal Runtime (Pin cụ thể bản Alpine tương ứng với builder)
FROM alpine:3.20 AS runner

RUN apk add --no-cache ca-certificates openssl tzdata

# Tạo user & group bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

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