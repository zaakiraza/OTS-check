require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
