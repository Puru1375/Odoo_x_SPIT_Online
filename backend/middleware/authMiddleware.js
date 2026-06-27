const jwt = require('jsonwebtoken');

// 1. Verify Token (Authentication)
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds { id, role } to req
    next();
  } catch (_err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// 2. Check Role (Authorization)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }
    next();
  };
};

// 3. Rate Limiting
const rateLimitStore = {};

const rateLimit = (req, res, next) => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 100;
  
  // Use user ID if authenticated, otherwise use IP address
  const identifier = req.user?.id || req.ip;
  const now = Date.now();
  
  if (!rateLimitStore[identifier]) {
    rateLimitStore[identifier] = { requests: [now] };
  } else {
    // Remove old requests outside the window
    rateLimitStore[identifier].requests = rateLimitStore[identifier].requests.filter(
      time => now - time < windowMs
    );
    
    // Add current request
    rateLimitStore[identifier].requests.push(now);
    
    // Check if exceeded limit
    if (rateLimitStore[identifier].requests.length > maxRequests) {
      return res.status(429).json({ message: "Too many requests, please try again later" });
    }
  }
  
  next();
};

// 4. Strict Rate Limiting for Authentication Endpoints
const authRateLimitStore = {};

const authRateLimit = (req, res, next) => {
  const windowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 600000; // 10 minutes
  const maxRequests = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5; // Stricter: 5 requests
  
  // Use IP address for auth endpoints (unauthenticated users)
  const identifier = req.ip;
  const now = Date.now();
  
  if (!authRateLimitStore[identifier]) {
    authRateLimitStore[identifier] = { requests: [now] };
  } else {
    // Remove old requests outside the window
    authRateLimitStore[identifier].requests = authRateLimitStore[identifier].requests.filter(
      time => now - time < windowMs
    );
    
    // Add current request
    authRateLimitStore[identifier].requests.push(now);
    
    // Check if exceeded limit
    if (authRateLimitStore[identifier].requests.length > maxRequests) {
      return res.status(429).json({ message: "Too many authentication attempts. Please try again later." });
    }
  }
  
  next();
};

module.exports = { protect, authorize, rateLimit, authRateLimit };