require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3006;
const SERVICE = process.env.SERVICE_NAME || 'notification-service';

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: SERVICE,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE} running → http://localhost:${PORT}`);
  console.log(`   Health → http://localhost:${PORT}/health`);
});

module.exports = app;