FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY notification-service/package*.json ./notification-service/
RUN cd notification-service && npm install
COPY notification-service/ ./notification-service/
WORKDIR /app/notification-service
EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3006/health || exit 1
CMD ["node", "src/server.js"]
