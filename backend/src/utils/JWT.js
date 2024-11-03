const jwt = require("jsonwebtoken");

const generateAccessToken = (uId) => {
  const accessToken = jwt.sign(
    { userId: uId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  return accessToken;
};

const generateRefreshToken = (uId) => {
  const refreshToken = jwt.sign(
    { userId: uId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "2m" }
  );
  return refreshToken;
};

module.exports = { generateAccessToken, generateRefreshToken };
