FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install
COPY shared/ ./shared/
COPY staff-service/package*.json ./staff-service/
RUN cd staff-service && npm install
COPY staff-service/ ./staff-service/
WORKDIR /app/staff-service
EXPOSE 3008
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:3008/health || exit 1
CMD ["node", "src/server.js"]
