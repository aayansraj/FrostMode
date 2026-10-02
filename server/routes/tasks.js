const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Day = require("../models/Day");
const User = require("../models/User");
const Arc = require("../models/Arc");
const PointsLog = require("../models/PointsLog");
const authMiddleware = require("../middleware/auth");
const { calculateLevel } = require("../utils/levelHelper");
const { checkAndAwardBadges } = require("../utils/badgeChecker");

// @route POST /api/tasks
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { dayId, title, category = "Productivity", time = "09:00 AM", duration = 30, difficulty = "medium", points, strict = false } = req.body;

    if (!dayId || !title) {
      return res.status(400).json({ error: "dayId and title are required" });
    }

    const day = await Day.findOne({ _id: dayId, userId });
    if (!day) return res.status(404).json({ error: "Day not found" });

    // Check strict mode lock
    const user = await User.findById(userId);
    if (user.strictMode) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (day.date <= todayStr) {
        return res.status(403).json({ error: "Strict Mode is Active: Cannot add new tasks to today or past days!" });
      }
    }

    const diffPoints = { easy: 10, medium: 20, hard: 30 };
    const basePoints = points || diffPoints[difficulty] || 20;

    const taskCount = await Task.countDocuments({ dayId });

    const newTask = await Task.create({
      dayId,
      userId,
      title,
      category,
      time,
      duration,
      difficulty,
      points: basePoints,
      strict: Boolean(strict),
      status: "pending",
      pointsEarned: 0,
      order: taskCount
    });

    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// @route PUT /api/tasks/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, category, time, duration, difficulty, points, strict } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const day = await Day.findById(task.dayId);
    const user = await User.findById(userId);

    if (user.strictMode && day) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (day.date <= todayStr) {
        return res.status(403).json({ error: "Strict Mode is Active: Tasks on active or past days cannot be edited!" });
      }
    }

    if (title) task.title = title;
    if (category) task.category = category;
    if (time) task.time = time;
    if (duration) task.duration = duration;
    if (difficulty) task.difficulty = difficulty;
    if (points !== undefined) task.points = points;
    if (strict !== undefined) task.strict = Boolean(strict);

    await task.save();

    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// @route DELETE /api/tasks/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const day = await Day.findById(task.dayId);
    const user = await User.findById(userId);

    if (user.strictMode && day) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (day.date <= todayStr) {
        return res.status(403).json({ error: "Strict Mode is Active: Tasks on active or past days cannot be deleted!" });
      }
    }

    await Task.findByIdAndDelete(task._id);

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// @route PATCH /api/tasks/:id/status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.body; // 'followed', 'not_followed', 'pending'

    if (!["followed", "not_followed", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid task status" });
    }

    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const user = await User.findById(userId);
    const day = await Day.findById(task.dayId);
    if (!day) return res.status(404).json({ error: "Day not found for task" });

    // Strict Mode validation for changing past locked tasks
    if (user.strictMode) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (day.date < todayStr && task.status !== "pending") {
        return res.status(403).json({ error: "Strict Mode is Active: Past completed/skipped tasks are locked and cannot be changed!" });
      }
    }

    const prevStatus = task.status;
    const prevPointsEarned = task.pointsEarned || 0;

    // Rollback previous points if changing status
    if (prevStatus === "followed") {
      user.totalPoints = Math.max(0, user.totalPoints - prevPointsEarned);
      user.walletPoints = Math.max(0, user.walletPoints - prevPointsEarned);
    } else if (prevStatus === "not_followed" && prevPointsEarned < 0) {
      // Revert penalty
      user.totalPoints = user.totalPoints + Math.abs(prevPointsEarned);
      user.walletPoints = user.walletPoints + Math.abs(prevPointsEarned);
    }

    let newPointsEarned = 0;
    let arcBrokenWarning = false;

    if (status === "followed") {
      // Calculate points with 1.5x Strict Mode multiplier
      const multiplier = user.strictMode ? 1.5 : 1.0;
      newPointsEarned = Math.round((task.points || 20) * multiplier);
      task.status = "followed";
      task.pointsEarned = newPointsEarned;
      task.completedAt = new Date();

      user.totalPoints += newPointsEarned;
      user.walletPoints += newPointsEarned;

      await PointsLog.create({
        userId,
        points: newPointsEarned,
        type: "earned",
        reason: `Task followed: ${task.title}${user.strictMode ? " (Strict 1.5x)" : ""}`
      });
    } else if (status === "not_followed") {
      // Penalty calculation
      let penalty = task.points || 20;
      if (user.strictMode && task.strict) {
        // Double penalty for strict tasks in Strict Mode
        penalty = penalty * 2;
      }

      newPointsEarned = -penalty;
      task.status = "not_followed";
      task.pointsEarned = newPointsEarned;
      task.completedAt = new Date();

      user.totalPoints = Math.max(0, user.totalPoints - penalty);
      user.walletPoints = Math.max(0, user.walletPoints - penalty);

      await PointsLog.create({
        userId,
        points: -penalty,
        type: "lost",
        reason: `Task missed: ${task.title}${user.strictMode && task.strict ? " (Strict Double Penalty)" : ""}`
      });
    } else {
      task.status = "pending";
      task.pointsEarned = 0;
    }

    await task.save();

    // Recalculate Day statistics
    const dayTasks = await Task.find({ dayId: day._id });
    const totalCount = dayTasks.length;
    const followedCount = dayTasks.filter(t => t.status === "followed").length;
    const missedCount = dayTasks.filter(t => t.status === "not_followed").length;

    const completionRate = totalCount > 0 ? Math.round((followedCount / totalCount) * 100) : 0;
    day.completionRate = completionRate;

    const prevDayStatus = day.status;

    if (completionRate === 100) {
      day.status = "perfect";
      // Award +50 Perfect Day bonus if not previously awarded
      if (prevDayStatus !== "perfect") {
        user.totalPoints += 50;
        user.walletPoints += 50;
        await PointsLog.create({
          userId,
          points: 50,
          type: "earned",
          reason: `Perfect Day Bonus (Day ${day.dayNumber})`
        });
      }
    } else if (followedCount > 0) {
      day.status = "partial";
    } else if (missedCount > 0) {
      day.status = "missed";
    } else {
      day.status = "pending";
    }

    await day.save();

    // Check Strict Mode Arc Broken condition: 3 missed tasks in a day
    if (user.strictMode && missedCount >= 3) {
      arcBrokenWarning = true;
      user.streak = 0; // Streak reset!
    } else {
      // Update Streak
      const allDays = await Day.find({ userId }).sort({ dayNumber: 1 });
      let currentStreak = 0;
      for (const d of allDays) {
        if (d.status === "perfect" || d.status === "partial") {
          currentStreak++;
        } else if (d.status === "missed") {
          currentStreak = 0;
        }
      }
      user.streak = currentStreak;
      if (currentStreak > user.bestStreak) {
        user.bestStreak = currentStreak;
      }
    }

    // Check level upgrade
    user.level = calculateLevel(user.totalPoints);
    await user.save();

    // Check and award badges
    const newBadges = await checkAndAwardBadges(user);

    // Socket.io real-time leaderboard update broadcast
    const io = req.app.get("socketio");
    if (io) {
      io.emit("leaderboard_update", {
        userId: user._id,
        displayName: user.displayName,
        totalPoints: user.totalPoints,
        level: user.level,
        streak: user.streak
      });
    }

    res.json({
      message: "Task status updated",
      task,
      day,
      user: {
        totalPoints: user.totalPoints,
        walletPoints: user.walletPoints,
        level: user.level,
        streak: user.streak,
        bestStreak: user.bestStreak
      },
      arcBrokenWarning,
      newBadges
    });
  } catch (err) {
    console.error("Update task status error:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

module.exports = router;
