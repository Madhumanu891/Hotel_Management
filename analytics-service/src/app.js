require('dotenv').config();
const express          = require('express');
const helmet           = require('helmet');
const cors             = require('cors');
const morgan           = require('morgan');
const cookieParser     = require('cookie-parser');
const logger           = require('./utils/logger');
const errorHandler     = require('../../shared/middlewares/errorHandler');
const notFound         = require('../../shared/middlewares/notFound');
const analyticsRoutes  = require('./routes/analyticsRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: logger.stream, skip: (req) => req.url === '/health' }));

app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id']
    || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true, status: 'OK',
    service: process.env.SERVICE_NAME || 'analytics-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/analytics', analyticsRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;