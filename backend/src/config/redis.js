const redis = require("redis");

let redisClient;

const connectRedis = async () => {
  if (!redisClient) {
    console.log("Initializing Redis client...");
    redisClient = redis.createClient({
      url: "redis://localhost:6379", // Use "redis" as the host name in Docker
    });

    try {
      await redisClient.connect();
      console.log("Connected to Redis");
    } catch (err) {
      console.error("Redis connection error:", err);
    }

    redisClient.on("error", (err) => {
      console.error("Redis runtime error:", err);
    });
  }
  return redisClient;
};

module.exports = connectRedis;
