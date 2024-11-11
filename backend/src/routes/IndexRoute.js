const auctionsRoute = require("./AuctionRoute");
const usersAuthRoute = require("./UsersAuthRoute");

const indexRoute = require("express").Router();
indexRoute.use("/auth", usersAuthRoute);
indexRoute.use("/auctions", auctionsRoute);

module.exports = indexRoute;
