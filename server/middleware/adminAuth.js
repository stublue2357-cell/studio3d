const jwt = require('jsonwebtoken');

// 1. Token Check Karne Wala Function
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: "NO TOKEN // AUTHORIZATION DENIED" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ msg: "TOKEN INVALID // ACCESS DENIED" });
  }
};

// 2. Any Admin Level Check (Admin, Sub-Owner, Developer)
const anyAdminLevel = (req, res, next) => {
  const roles = ['admin', 'owner', 'sub-owner', 'developer'];
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ msg: "PROTOCOL ERROR // ADMIN PRIVILEGES REQUIRED" });
  }
  next();
};

// 3. Owner Level Check (Sub-Owner, Developer)
const ownerOnly = (req, res, next) => {
  const roles = ['owner', 'sub-owner', 'developer'];
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ msg: "PROTOCOL ERROR // OWNER PRIVILEGES REQUIRED" });
  }
  next();
};

module.exports = { authMiddleware, anyAdminLevel, ownerOnly };