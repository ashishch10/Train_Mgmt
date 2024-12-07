const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

const adminAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.ADMIN_API_KEY)
    return res.status(403).json({ message: "Forbidden" });
  next();
};

module.exports = { jwtAuth, adminAuth };
