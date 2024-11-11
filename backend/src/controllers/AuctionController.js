const prisma = require("../config/prismaClient");

// Create a New Auction
const createAuction = async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const { title, description, startPrice, endTime } = req.body;
    const newAuction = await prisma.auction.create({
      data: {
        title,
        description,
        startPrice,
        endTime: new Date(endTime),
        sellerId: req.userId,
      },
    });
    const auctionKey = `auction:${newAuction.id}`;
    await redisClient.hset(auctionKey, {
      status: "active",
      endTime: endTime.toISOString(),
    });
    // Set Redis expiry for automatic cleanup after end time
    const auctionEndTime = new Date(endTime).getTime();
    const currentTime = Date.now();
    const expireIn = Math.max(auctionEndTime - currentTime, 0);
    await redisClient.expire(auctionKey, Math.floor(expireIn / 1000));

    res
      .status(201)
      .json({ message: "Auction created successfully", auction: newAuction });
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get auctions
const getAuctions = async (req, res) => {
  const { status } = req.query;

  try {
    const filter = {};
    if (status === "status" || status === "closed") {
      filter.status = status;
    }

    // Fetch auctions from the database
    const auctions = await prisma.auction.findMany({
      where: filter,
      orderBy: { endTime: "asc" }, // Optional: order by end time
    });

    res.status(200).json({ auctions });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createAuction, getAuctions };
