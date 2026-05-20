FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY payment-service/package*.json ./payment-service/
RUN cd payment-service && npm install
COPY payment-service/ ./payment-service/
WORKDIR /app/payment-service
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3004/health || exit 1
CMD ["node", "src/server.js"]
