FROM node:20-alpine
WORKDIR /app

# Install shared dependencies first
COPY shared/package*.json ./shared/
RUN cd shared && npm install    # ← changed from npm ci

COPY shared/ ./shared/

COPY api-gateway/package*.json ./api-gateway/
RUN cd api-gateway && npm install

COPY api-gateway/ ./api-gateway/
WORKDIR /app/api-gateway
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/server.js"]