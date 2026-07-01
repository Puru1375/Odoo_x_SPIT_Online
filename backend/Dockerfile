# ==========================
# Stage 1 - Dependencies
# ==========================
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

# ==========================
# Stage 2 - Builder
# ==========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

# ==========================
# Stage 3 - Production


FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev \
 && npm cache clean --force \
 && rm -rf /root/.npm

RUN apk add --no-cache curl

COPY --from=builder /app/routes ./routes
COPY --from=builder /app/models ./models
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/index.js ./
COPY --from=builder /app/db.js ./
COPY --from=builder /app/logger.js ./
COPY --from=builder /app/redisClient.js ./

RUN mkdir -p logs/error logs/combined logs/http && \
    addgroup -S nodegroup && adduser -S nodeuser -G nodegroup && \
    chown -R nodeuser:nodegroup /app && \
    rm -rf /tmp/* /var/tmp/*

USER nodeuser

EXPOSE 5000

LABEL maintainer="Purvanshu"

LABEL project="OdooSpit Inventory"

LABEL version="1.0.0"

HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=20s \
            --retries=3 \
            CMD wget --spider http://localhost:5000/health || exit 1

CMD ["node","index.js"]