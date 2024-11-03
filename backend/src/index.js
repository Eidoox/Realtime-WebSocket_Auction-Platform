require("dotenv").config();
const express = require("express");
const indexRoute = require("./routes/IndexRoute");
const connectRedis = require("./config/redis");

const app = express();
app.use(express.json());

(async () => {
  const redisClient = await connectRedis();

  app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
  });

  app.use("/api/v1", indexRoute);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
