const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateTokens = (userId, role) => {
  // Access token : short-lived
  // role is included so middleware doesn't need a DB lookup to check permissions
  const accessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" },
  );

  // Refresh token: long-lived
  //we are include role because it might change while token is active
  const refreshToken = jwt.sign(
    { userId},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" },
  );

  return { accessToken, refreshToken };
};

// hashToken
// SHA-256 hash a token before storing in database
// We store the HASH — not the real token
// If DB is breached, attacker gets hashes they cannot reverse

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// setCookiesOptions
// Consistent cookie settings used in both register and login

const getCookieOptions = () => ({
  httpOnly: true, // javascript cannot read this cookies - XSS protection
  secure: process.env.NODE_ENV === "production", //HTTPS only in production
  sameSite: "strict", //Cookies not sent on cross-site requests -CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 100, //7 days
});

module.exports = { generateTokens, hashToken, getCookieOptions };
