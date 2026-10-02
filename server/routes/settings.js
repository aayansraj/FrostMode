const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");
const PointsLog = require("../models/PointsLog");
const Arc = require("../models/Arc");
const authMiddleware = require("../middleware/auth");

// @route PUT /api/settings
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, avatar, showOnLeaderboard, strictMode } = req.body;

    const user = await User.findById(userId);

    if (displayName) user.displayName = displayName;
    if (avatar) user.avatar = avatar;
    if (showOnLeaderboard !== undefined) user.showOnLeaderboard = Boolean(showOnLeaderboard);

    let penaltyApplied = false;

    if (strictMode !== undefined) {
      const newStrictMode = Boolean(strictMode);
      // Turning OFF Strict Mode gives 100 points penalty
      if (user.strictMode && !newStrictMode) {
        user.totalPoints = Math.max(0, user.totalPoints - 100);
        user.walletPoints = Math.max(0, user.walletPoints - 100);
        penaltyApplied = true;

        await PointsLog.create({
          userId,
          points: -100,
          type: "lost",
          reason: "Strict Mode disabled penalty"
        });
      }

      user.strictMode = newStrictMode;
      await Arc.updateMany({ userId, status: "active" }, { strictMode: newStrictMode });
    }

    await user.save();

    res.json({
      message: penaltyApplied
        ? "Strict mode disabled. 100 points penalty applied."
        : "Settings updated successfully",
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        walletPoints: user.walletPoints,
        level: user.level,
        streak: user.streak,
        bestStreak: user.bestStreak,
        strictMode: user.strictMode,
        showOnLeaderboard: user.showOnLeaderboard
      }
    });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// @route GET /api/settings/export
router.get("/export", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({ userId }).sort({ dayId: 1, order: 1 });
    const logs = await PointsLog.find({ userId }).sort({ date: -1 });

    let csvContent = "TYPE,TITLE/REASON,CATEGORY,STATUS,POINTS,DATE\n";

    tasks.forEach(t => {
      csvContent += `TASK,"${t.title.replace(/"/g, '""')}","${t.category}","${t.status}",${t.pointsEarned},"${t.completedAt || ''}"\n`;
    });

    logs.forEach(l => {
      csvContent += `LOG,"${l.reason.replace(/"/g, '""')}","${l.type}","-",${l.points},"${l.date.toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="frostmode_export.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error("Export data error:", err);
    res.status(500).json({ error: "Failed to export data" });
  }
});

module.exports = router;
