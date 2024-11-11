const { createAuction } = require("../controllers/AuctionController");
const authenticateToken = require("../middlewares/AuthMiddleware");

const auctionsRoute = require("express").Router();

auctionsRoute.post("/", authenticateToken, createAuction);

module.exports = auctionsRoute;
