const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const redisClient = require("./prismaClient");

const setupSocket = (server, redisClient) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  // Middleware to authenticate users on socket connection
  io.use((socket, next) => {
    const authToken =
      socket.handshake.auth.token || socket.handshake.query.token;

    if (!authToken) return next(new Error("Authentication Error"));
    jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication Error"));
      socket.userId = decoded.userId;
      return next();
    });
  });

  io.on("connection", (socket) => {
    // Handle Joining The Auction
    socket.on("join_auction", async ({ auctionId }) => {
      console.log(auctionId);
      const auction = await redisClient.hgetall(`auction:${auctionId}`);
      console.log(auction);
    });

    // Handle Disconnection..
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;
