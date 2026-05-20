FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY housekeeping-service/package*.json ./housekeeping-service/
RUN cd housekeeping-service && npm install
COPY housekeeping-service/ ./housekeeping-service/
WORKDIR /app/housekeeping-service
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3005/health || exit 1
CMD ["node", "src/server.js"]
