FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY restaurant-service/package*.json ./restaurant-service/
RUN cd restaurant-service && npm install
COPY restaurant-service/ ./restaurant-service/
WORKDIR /app/restaurant-service
EXPOSE 3007
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3007/health || exit 1
CMD ["node", "src/server.js"]
