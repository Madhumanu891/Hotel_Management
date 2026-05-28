const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf, json } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, service, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? '\n' + JSON.stringify(meta, null, 2)
      : '';
    return `[${timestamp}] ${level} ${service || 'app'}: ${message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), json());

const logger = createLogger({
  level:       process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: process.env.SERVICE_NAME || 'service' },
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    }),
  ],
});

logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;