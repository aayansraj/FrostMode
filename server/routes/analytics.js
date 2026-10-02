const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Day = require("../models/Day");
const Badge = require("../models/Badge");
const PointsLog = require("../models/PointsLog");
const authMiddleware = require("../middleware/auth");

// @route GET /api/analytics
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Completion rate by category
    const userTasks = await Task.find({ userId });

    const categoryStatsMap = {};
    userTasks.forEach(t => {
      const cat = t.category || "General";
      if (!categoryStatsMap[cat]) {
        categoryStatsMap[cat] = { total: 0, followed: 0, missed: 0 };
      }
      categoryStatsMap[cat].total += 1;
      if (t.status === "followed") categoryStatsMap[cat].followed += 1;
      if (t.status === "not_followed") categoryStatsMap[cat].missed += 1;
    });

    const categoryStats = Object.keys(categoryStatsMap).map(cat => ({
      category: cat,
      total: categoryStatsMap[cat].total,
      followed: categoryStatsMap[cat].followed,
      rate: Math.round((categoryStatsMap[cat].followed / categoryStatsMap[cat].total) * 100)
    }));

    // 2. Day of week distribution
    const days = await Day.find({ userId });
    const dayOfWeekMap = { Sun: { followed: 0, total: 0 }, Mon: { followed: 0, total: 0 }, Tue: { followed: 0, total: 0 }, Wed: { followed: 0, total: 0 }, Thu: { followed: 0, total: 0 }, Fri: { followed: 0, total: 0 }, Sat: { followed: 0, total: 0 } };

    const daysOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach(d => {
      if (d.date) {
        const dateObj = new Date(d.date);
        const dayName = daysOfWeekNames[dateObj.getDay()];
        if (dayOfWeekMap[dayName]) {
          dayOfWeekMap[dayName].total += 1;
          if (d.status === "perfect" || d.status === "partial") {
            dayOfWeekMap[dayName].followed += 1;
          }
        }
      }
    });

    const dayOfWeekStats = Object.keys(dayOfWeekMap).map(dayName => ({
      day: dayName,
      rate: dayOfWeekMap[dayName].total > 0 ? Math.round((dayOfWeekMap[dayName].followed / dayOfWeekMap[dayName].total) * 100) : 0
    }));

    // 3. Points trend over time (last 14 days)
    const pointsLogs = await PointsLog.find({ userId }).sort({ date: 1 });
    const datePointsMap = {};
    pointsLogs.forEach(log => {
      const dateStr = new Date(log.date).toISOString().split("T")[0];
      datePointsMap[dateStr] = (datePointsMap[dateStr] || 0) + log.points;
    });

    const pointsTrend = Object.keys(datePointsMap).slice(-14).map(dateStr => ({
      date: dateStr,
      points: datePointsMap[dateStr]
    }));

    // 4. Badges earned
    const badges = await Badge.find({ userId }).sort({ earnedAt: -1 });

    res.json({
      categoryStats,
      dayOfWeekStats,
      pointsTrend,
      badges
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
