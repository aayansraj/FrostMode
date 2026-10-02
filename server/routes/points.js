const express = require("express");
const router = express.Router();
const PointsLog = require("../models/PointsLog");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { calculateLevel } = require("../utils/levelHelper");

// Helper to get progress % to next level
function getLevelProgress(points) {
  if (points >= 5000) return { level: "Winter King", nextLevel: "Max", progressPct: 100, needed: 0 };
  if (points >= 3000) return { level: "Legend", nextLevel: "Winter King", progressPct: Math.round(((points - 3000) / 2000) * 100), needed: 5000 - points };
  if (points >= 1500) return { level: "Beast", nextLevel: "Legend", progressPct: Math.round(((points - 1500) / 1500) * 100), needed: 3000 - points };
  if (points >= 500) return { level: "Warrior", nextLevel: "Beast", progressPct: Math.round(((points - 500) / 1000) * 100), needed: 1500 - points };
  return { level: "Beginner", nextLevel: "Warrior", progressPct: Math.round((points / 500) * 100), needed: 500 - points };
}

// @route GET /api/points/summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const levelInfo = getLevelProgress(user.totalPoints);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const logsToday = await PointsLog.find({ userId: user._id, date: { $gte: todayStart } });
    const pointsToday = logsToday.reduce((acc, log) => acc + log.points, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const logsWeek = await PointsLog.find({ userId: user._id, date: { $gte: weekStart } });
    const pointsWeek = logsWeek.reduce((acc, log) => acc + log.points, 0);

    res.json({
      totalPoints: user.totalPoints,
      walletPoints: user.walletPoints,
      streak: user.streak,
      bestStreak: user.bestStreak,
      strictMode: user.strictMode,
      pointsToday,
      pointsWeek,
      ...levelInfo
    });
  } catch (err) {
    console.error("Get points summary error:", err);
    res.status(500).json({ error: "Failed to fetch points summary" });
  }
});

// @route GET /api/points/history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    const query = { userId: req.user._id };

    if (type && ["earned", "lost"].includes(type)) {
      query.type = type;
    }

    const logs = await PointsLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10) || 50);

    res.json({ logs });
  } catch (err) {
    console.error("Get points history error:", err);
    res.status(500).json({ error: "Failed to fetch points history" });
  }
});

module.exports = router;
