const express = require("express");
const router = express.Router();
const Arc = require("../models/Arc");
const Day = require("../models/Day");
const Task = require("../models/Task");
const LibraryTask = require("../models/LibraryTask");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// @route POST /api/arc/create
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { totalDays = 60, startDate, strictMode = false, categories = [], goals = [], selectedTaskIds = [] } = req.body;
    const userId = req.user._id;

    // Archive or update existing active arcs
    await Arc.updateMany({ userId, status: "active" }, { status: "completed" });

    const arcStartDate = startDate ? new Date(startDate) : new Date();

    const newArc = await Arc.create({
      userId,
      startDate: arcStartDate,
      totalDays: Number(totalDays),
      strictMode: Boolean(strictMode),
      categories,
      goals,
      status: "active"
    });

    // Update user's strict mode preference
    await User.findByIdAndUpdate(userId, { strictMode: Boolean(strictMode) });

    // Fetch initial library tasks to attach if selectedTaskIds provided, or pick defaults by categories
    let initialLibraryTasks = [];
    if (selectedTaskIds && selectedTaskIds.length > 0) {
      initialLibraryTasks = await LibraryTask.find({ _id: { $in: selectedTaskIds } });
    } else if (categories && categories.length > 0) {
      initialLibraryTasks = await LibraryTask.find({ category: { $in: categories } }).limit(6);
    } else {
      initialLibraryTasks = await LibraryTask.find({ isDefault: true }).limit(5);
    }

    const defaultTimes = ["05:30 AM", "07:00 AM", "09:00 AM", "01:00 PM", "05:00 PM", "08:30 PM", "10:00 PM"];

    // Generate Day records and attach initial tasks
    for (let i = 1; i <= totalDays; i++) {
      const dDate = new Date(arcStartDate);
      dDate.setDate(dDate.getDate() + (i - 1));
      const dateStr = dDate.toISOString().split("T")[0];

      const dayObj = await Day.create({
        arcId: newArc._id,
        userId,
        dayNumber: i,
        date: dateStr,
        status: "pending",
        note: "",
        completionRate: 0
      });

      // Populate routine tasks for each day from selected library tasks
      for (let j = 0; j < initialLibraryTasks.length; j++) {
        const lt = initialLibraryTasks[j];
        await Task.create({
          dayId: dayObj._id,
          userId,
          libraryTaskId: lt._id,
          title: lt.title,
          category: lt.category,
          time: defaultTimes[j % defaultTimes.length],
          duration: 30,
          difficulty: lt.difficulty,
          points: lt.points,
          strict: lt.strict,
          status: "pending",
          pointsEarned: 0,
          order: j
        });
      }
    }

    res.status(201).json({
      message: "Winter Arc started successfully!",
      arc: newArc
    });
  } catch (err) {
    console.error("Create arc error:", err);
    res.status(500).json({ error: "Failed to create Arc" });
  }
});

// @route GET /api/arc/current
router.get("/current", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const arc = await Arc.findOne({ userId, status: "active" }).sort({ createdAt: -1 });

    if (!arc) {
      return res.json({ arc: null, currentDayNumber: 1 });
    }

    const today = new Date();
    const startDate = new Date(arc.startDate);
    const diffTime = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    let currentDayNumber = diffTime + 1;
    if (currentDayNumber < 1) currentDayNumber = 1;
    if (currentDayNumber > arc.totalDays) currentDayNumber = arc.totalDays;

    res.json({
      arc,
      currentDayNumber
    });
  } catch (err) {
    console.error("Get current arc error:", err);
    res.status(500).json({ error: "Failed to fetch current Arc" });
  }
});

// @route PUT /api/arc/update
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { strictMode, goals, categories } = req.body;

    const arc = await Arc.findOne({ userId, status: "active" });
    if (!arc) {
      return res.status(404).json({ error: "No active Arc found" });
    }

    if (strictMode !== undefined) {
      arc.strictMode = Boolean(strictMode);
      await User.findByIdAndUpdate(userId, { strictMode: Boolean(strictMode) });
    }
    if (goals) arc.goals = goals;
    if (categories) arc.categories = categories;

    await arc.save();

    res.json({ message: "Arc updated successfully", arc });
  } catch (err) {
    console.error("Update arc error:", err);
    res.status(500).json({ error: "Failed to update Arc" });
  }
});

// @route POST /api/arc/reset
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    await Arc.deleteMany({ userId });
    await Day.deleteMany({ userId });
    await Task.deleteMany({ userId });

    await User.findByIdAndUpdate(userId, { streak: 0 });

    res.json({ message: "Arc reset successfully. Ready to start fresh!" });
  } catch (err) {
    console.error("Reset arc error:", err);
    res.status(500).json({ error: "Failed to reset Arc" });
  }
});

module.exports = router;
