FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY booking-service/package*.json ./booking-service/
RUN cd booking-service && npm install
COPY booking-service/ ./booking-service/
WORKDIR /app/booking-service
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3003/health || exit 1
CMD ["node", "src/server.js"]
