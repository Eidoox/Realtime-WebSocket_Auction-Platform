const bcrypt = require("bcryptjs");
const prisma = require("../config/prismaClient");
const { generateAccessToken, generateRefreshToken } = require("../utils/JWT");
const jwt = require("jsonwebtoken");

// Register Users

const registerUsers = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = generateAccessToken(newUser.id);

    const refreshToken = generateRefreshToken(newUser.id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Users

const loginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const accessToken = generateAccessToken(user.id);

    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get current user data

const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        auctions: {
          select: {
            id: true,
            title: true,
            description: true,
            startPrice: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
        bids: {
          select: {
            id: true,
            priceAmount: true,
            createdAt: true,
            auction: {
              select: {
                id: true,
                title: true,
                description: true,
                endTime: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout users

const logoutUsers = async (req, res) => {
  const { refreshToken } = req.body;
  const redisClient = req.redisClient;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const value = await redisClient.get(`blacklist:${refreshToken}`);
    if (value === "true") {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const expiresIn = decoded.exp * 1000 - Date.now();

    await redisClient.set(`blacklist:${refreshToken}`, "true", "PX", expiresIn); // using PX  ensures that Redis will automatically delete the key after the specified time in milliseconds

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// Request A New Access Token

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  const redisClient = req.redisClient;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // Check if the refresh token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = generateAccessToken(decoded.userId);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = {
  registerUsers,
  loginUsers,
  getUserData,
  logoutUsers,
  refreshAccessToken,
};
