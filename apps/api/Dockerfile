# Stage 1: Build binary
FROM golang:1.23-bookworm AS builder

ENV GOTOOLCHAIN=auto

# Cài đặt thư viện phụ trợ build
RUN apt-get update && apt-get install -y git ca-certificates openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy mã nguồn
COPY . .

# Xóa các file Prisma cũ được copy từ máy local nếu có
RUN rm -rf prisma/db

# Generate Prisma Client Go code
RUN go run github.com/steebchen/prisma-client-go generate

# Tải sẵn Prisma Engine lõi (Bỏ qua quá trình tự động giải nén hay gây lỗi EACCES)
RUN apt-get update && apt-get install -y wget gzip
RUN wget https://binaries.prisma.sh/all_commits/a9055b89e58b4b5bfb59600785423b1db3d0e75d/debian-openssl-3.0.x/query-engine.gz -O /app/query-engine.gz && \
    gunzip /app/query-engine.gz && \
    chmod +x /app/query-engine

# Build static binary với cờ -p 1 (đơn tiến trình) để tiết kiệm bộ nhớ RAM, tránh bị OOM (signal killed)
RUN CGO_ENABLED=0 GOOS=linux go build -p 1 -ldflags="-s -w" -o server ./cmd/server

# Stage 2: Minimal Runtime
FROM debian:bookworm AS runner

RUN apt-get update && apt-get install -y ca-certificates openssl tzdata && rm -rf /var/lib/apt/lists/*

# Tạo user & group bảo mật
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy binary và prisma schema
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/query-engine ./query-engine

# Chuẩn bị folder upload, tmp và phân quyền
RUN mkdir -p /app/uploads /app/tmp && chmod 777 /app/tmp && chmod +x /app/query-engine && chown -R appuser:appgroup /app

# Chạy dưới quyền appuser (An toàn hơn)
USER appuser

ENV PORT=8080 \
    GIN_MODE=release \
    TMPDIR=/app/tmp \
    PRISMA_QUERY_ENGINE_BINARY=/app/query-engine

EXPOSE 8080

CMD ["/app/server"]