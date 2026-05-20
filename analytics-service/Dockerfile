FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY analytics-service/package*.json ./analytics-service/
RUN cd analytics-service && npm install
COPY analytics-service/ ./analytics-service/
WORKDIR /app/analytics-service
EXPOSE 3009
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3009/health || exit 1
CMD ["node", "src/server.js"]
