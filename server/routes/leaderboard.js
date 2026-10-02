const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PointsLog = require("../models/PointsLog");
const authMiddleware = require("../middleware/auth");

// @route GET /api/leaderboard
router.get("/", async (req, res) => {
  try {
    const { timeframe = "all", strictOnly, search } = req.query;

    let userQuery = {};

    if (strictOnly === "true") {
      userQuery.strictMode = true;
    }

    if (search) {
      userQuery.displayName = { $regex: search, $options: "i" };
    }

    let users = [];

    if (timeframe === "all" || !timeframe) {
      users = await User.find(userQuery)
        .select("name displayName totalPoints walletPoints level streak bestStreak strictMode showOnLeaderboard avatar createdAt")
        .sort({ totalPoints: -1, streak: -1, createdAt: 1 });
    } else {
      // Timeframe based filtering using PointsLog
      let startDate = new Date();
      if (timeframe === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Aggregate points earned during this period
      const agg = await PointsLog.aggregate([
        { $match: { date: { $gte: startDate }, type: "earned" } },
        { $group: { _id: "$userId", periodPoints: { $sum: "$points" } } }
      ]);

      const pointsMap = {};
      agg.forEach(item => {
        pointsMap[item._id.toString()] = item.periodPoints;
      });

      const allMatchingUsers = await User.find(userQuery)
        .select("name displayName totalPoints walletPoints level streak bestStreak strictMode showOnLeaderboard avatar createdAt");

      users = allMatchingUsers.map(u => {
        const pPoints = pointsMap[u._id.toString()] || 0;
        return {
          ...u.toObject(),
          periodPoints: pPoints
        };
      });

      users.sort((a, b) => b.periodPoints - a.periodPoints || b.streak - a.streak);
    }

    // Format privacy and ranks
    const formattedUsers = users.map((u, idx) => {
      const isAnon = !u.showOnLeaderboard;
      return {
        id: u._id,
        rank: idx + 1,
        displayName: isAnon ? "Anonymous" : (u.displayName || u.name),
        avatar: isAnon ? "snowflake" : (u.avatar || "snowflake"),
        totalPoints: u.totalPoints,
        periodPoints: u.periodPoints !== undefined ? u.periodPoints : u.totalPoints,
        level: u.level,
        streak: u.streak,
        strictMode: u.strictMode,
        isAnonymous: isAnon
      };
    });

    // Top 3 Podium
    const podium = formattedUsers.slice(0, 3);

    res.json({
      leaderboard: formattedUsers,
      podium
    });
  } catch (err) {
    console.error("Get leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// @route GET /api/leaderboard/my-rank
router.get("/my-rank", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    const allUsers = await User.find({})
      .select("displayName totalPoints streak createdAt")
      .sort({ totalPoints: -1, streak: -1, createdAt: 1 });

    const userIndex = allUsers.findIndex(u => u._id.toString() === currentUserId);
    const myRank = userIndex !== -1 ? userIndex + 1 : allUsers.length;

    let pointsNeededForNextRank = 0;
    if (userIndex > 0) {
      const nextUser = allUsers[userIndex - 1];
      pointsNeededForNextRank = (nextUser.totalPoints - req.user.totalPoints) + 1;
    }

    res.json({
      myRank,
      totalUsers: allUsers.length,
      points: req.user.totalPoints,
      pointsNeededForNextRank: Math.max(0, pointsNeededForNextRank)
    });
  } catch (err) {
    console.error("Get my rank error:", err);
    res.status(500).json({ error: "Failed to fetch current user rank" });
  }
});

module.exports = router;
