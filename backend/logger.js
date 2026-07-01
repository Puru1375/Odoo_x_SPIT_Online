const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const sensitiveKeyPattern = /password|pass|jwt|token|secret|api[_-]?key|authorization|creditcard|credit_card|cardnumber|card_number|cc|cvv|cvc|pin/i;
const creditCardPattern = /(?:\b\d[ -]*?){13,19}\b/;

const redactValue = (value) => {
  if (typeof value === 'string' && creditCardPattern.test(value)) {
    return '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => {
        if (sensitiveKeyPattern.test(key)) {
          return [key, '[REDACTED]'];
        }

        return [key, redactValue(nestedValue)];
      })
    );
  }

  return value;
};

const redactionFormat = winston.format((info) => {
  const sanitized = redactValue(info);

  Object.keys(info).forEach((key) => {
    delete info[key];
  });

  Object.assign(info, sanitized);

  return info;
});

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define format for console output (development)
const consoleFormat = winston.format.combine(
  redactionFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  })
);

// Define format for file output (production)
const fileFormat = winston.format.combine(
  redactionFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
  winston.format.json(),
  winston.format.printf((info) => {
    return JSON.stringify(info);
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' })
  ),
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Error log file (daily rotation)
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'error', '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxDays: '14d',
      utc: true,
    }),

    // Combined log file (all levels - daily rotation)
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'combined', '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxDays: '14d',
      utc: true,
    }),

    // HTTP log file (API requests - daily rotation)
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'http', '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: fileFormat,
      maxSize: '20m',
      maxDays: '7d',
      utc: true,
    }),
  ],
});

// Export logger
module.exports = logger;
