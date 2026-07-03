// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./logger');
const { initDatabase } = require('./db');

const app = express();

// Disable X-Powered-By header to avoid exposing server info
app.disable('x-powered-by');

// Trust Proxy (for ALB, CloudFront, ECS, etc.)
// This ensures correct client IP identification for rate limiting and logging
app.set('trust proxy', 1);

// Middleware - Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  frameguard: { action: 'deny' }, // Prevent clickjacking
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filtering
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // HSTS
}));

// CORS with Explicit Origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON Size Limit (default 1MB, configurable via environment)
const jsonLimit = process.env.JSON_LIMIT || '10mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ limit: jsonLimit, extended: true }));

// Compression Middleware (Gzip compression for faster responses)
const compressionLevel = parseInt(process.env.COMPRESSION_LEVEL) || 6;
app.use(compression({ level: compressionLevel, filter: (req, res) => {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
}}));

// HTTP Request Logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production' 
  ? (tokens, req, res) => {
      const log = {
        timestamp: new Date().toISOString(),
        level: 'http',
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens['response-time'](req, res),
        contentLength: tokens.res(req, res, 'content-length'),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || null,
      };
      logger.http(log.url + ' - ' + log.status, log);
      return JSON.stringify(log);
    }
  : ':method :url :status :response-time ms - :res[content-length]';

app.use(morgan(morganFormat, { stream: { write: (msg) => logger.debug(msg.trim()) } }));

// Import Routes
app.use('/health', require('./routes/healthRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/moves', require('./routes/moveRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;

initDatabase()
  .then(() => {
    logger.info('✅ Postgres database connected successfully');
    app.listen(PORT, () => {
      logger.info(`🚀 Deployed Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('❌ Database Connection Error:', { error: err.message || err });
    logger.warn('⚠️ Starting server anyway. Database-backed routes will fail until Postgres is reachable.');
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} (Database offline)`);
    });
  });