const usersAuthRoute = require("./UsersAuthRoute");

const indexRoute = require("express").Router();
indexRoute.use("/auth", usersAuthRoute);

module.exports = indexRoute;
