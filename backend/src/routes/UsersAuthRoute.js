const {
  registerUsers,
  loginUsers,
  getUserData,
  logoutUsers,
  refreshAccessToken,
} = require("../controllers/UsersAuthController");
const authenticateToken = require("../middlewares/AuthMiddleware");

const usersAuthRoute = require("express").Router();

usersAuthRoute.post("/register", registerUsers);
usersAuthRoute.post("/login", loginUsers);
usersAuthRoute.get("/me", authenticateToken, getUserData);
usersAuthRoute.post("/logout", logoutUsers);
usersAuthRoute.post("/refresh-token", refreshAccessToken);

module.exports = usersAuthRoute;
