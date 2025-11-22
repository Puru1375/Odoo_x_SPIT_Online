const jwt = require('jsonwebtoken');

// 1. Verify Token (Authentication)
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds { id, role } to req
    next();
  } catch (err) {
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

module.exports = { protect, authorize };