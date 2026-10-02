const express = require("express");
const router = express.Router();
const Reward = require("../models/Reward");
const User = require("../models/User");
const PointsLog = require("../models/PointsLog");
const authMiddleware = require("../middleware/auth");

// @route GET /api/rewards
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rewards = await Reward.find({ userId: req.user._id }).sort({ redeemed: 1, cost: 1 });
    res.json({ rewards });
  } catch (err) {
    console.error("Get rewards error:", err);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

// @route POST /api/rewards
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, cost } = req.body;

    if (!title || !cost || Number(cost) <= 0) {
      return res.status(400).json({ error: "Please provide a valid title and cost > 0" });
    }

    const reward = await Reward.create({
      userId: req.user._id,
      title,
      cost: Number(cost),
      redeemed: false
    });

    res.status(201).json({ message: "Custom reward created", reward });
  } catch (err) {
    console.error("Create reward error:", err);
    res.status(500).json({ error: "Failed to create reward" });
  }
});

// @route POST /api/rewards/:id/redeem
router.post("/:id/redeem", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const reward = await Reward.findOne({ _id: req.params.id, userId });
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    if (reward.redeemed) {
      return res.status(400).json({ error: "Reward has already been redeemed" });
    }

    const user = await User.findById(userId);
    if (user.walletPoints < reward.cost) {
      return res.status(400).json({
        error: `Insufficient Wallet Points! You need ${reward.cost} points, but you have ${user.walletPoints} points.`
      });
    }

    // Deduct spendable wallet points (DO NOT touch totalPoints for leaderboard!)
    user.walletPoints -= reward.cost;
    await user.save();

    reward.redeemed = true;
    reward.redeemedAt = new Date();
    await reward.save();

    await PointsLog.create({
      userId,
      points: -reward.cost,
      type: "lost",
      reason: `Redeemed Reward: ${reward.title}`
    });

    res.json({
      message: `Reward "${reward.title}" redeemed successfully! Enjoy your reward! 🎉`,
      reward,
      walletPoints: user.walletPoints
    });
  } catch (err) {
    console.error("Redeem reward error:", err);
    res.status(500).json({ error: "Failed to redeem reward" });
  }
});

module.exports = router;
