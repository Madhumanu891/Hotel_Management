FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY property-service/package*.json ./property-service/
RUN cd property-service && npm install
COPY property-service/ ./property-service/
WORKDIR /app/property-service
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "src/server.js"]
