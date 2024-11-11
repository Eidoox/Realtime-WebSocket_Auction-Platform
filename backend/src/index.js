require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const indexRoute = require("./routes/IndexRoute");
const connectRedis = require("./config/redis");
const setupSocket = require("./config/socket");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

(async () => {
  const redisClient = await connectRedis();

  app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
  });

  app.use("/api/v1", indexRoute);

  // Set up Socket.IO with Redis and server
  const io = setupSocket(server, redisClient);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
