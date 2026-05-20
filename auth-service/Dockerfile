FROM node:20-alpine
WORKDIR /app

# Install shared dependencies first
COPY shared/package*.json ./shared/
RUN cd shared && npm install

# Copy shared source
COPY shared/ ./shared/

# Install service dependencies
COPY auth-service/package*.json ./auth-service/
RUN cd auth-service && npm install

# Copy service source
COPY auth-service/ ./auth-service/

WORKDIR /app/auth-service

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]