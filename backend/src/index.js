require("dotenv").config();
const express = require("express");
const indexRoute = require("./routes/IndexRoute");
const connectRedis = require("./config/redis");

const app = express();
app.use(express.json());

const redisClient = connectRedis();

app.use((req, res, next) => {
  req.redisClient = redisClient; // Attach to each request
  next(); // Call next to proceed to the route handler
});

app.use("/api/v1", indexRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
