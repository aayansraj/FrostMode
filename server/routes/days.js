const express = require("express");
const router = express.Router();
const Arc = require("../models/Arc");
const Day = require("../models/Day");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

// @route GET /api/days
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const arc = await Arc.findOne({ userId, status: "active" }).sort({ createdAt: -1 });

    if (!arc) {
      return res.json({ days: [] });
    }

    const days = await Day.find({ arcId: arc._id, userId }).sort({ dayNumber: 1 });
    res.json({ days });
  } catch (err) {
    console.error("Get days error:", err);
    res.status(500).json({ error: "Failed to fetch days" });
  }
});

// @route GET /api/days/:dayNumber
router.get("/:dayNumber", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const dayNumber = Number(req.params.dayNumber);

    const arc = await Arc.findOne({ userId, status: "active" }).sort({ createdAt: -1 });
    if (!arc) {
      return res.status(404).json({ error: "No active Arc found" });
    }

    let day = await Day.findOne({ arcId: arc._id, userId, dayNumber });
    if (!day) {
      // Create if day record missing
      const dDate = new Date(arc.startDate);
      dDate.setDate(dDate.getDate() + (dayNumber - 1));
      const dateStr = dDate.toISOString().split("T")[0];

      day = await Day.create({
        arcId: arc._id,
        userId,
        dayNumber,
        date: dateStr,
        status: "pending",
        note: "",
        completionRate: 0
      });
    }

    const tasks = await Task.find({ dayId: day._id }).sort({ order: 1, time: 1 });

    res.json({ day, tasks });
  } catch (err) {
    console.error("Get day error:", err);
    res.status(500).json({ error: "Failed to fetch day details" });
  }
});

// @route PUT /api/days/:dayNumber/note
router.put("/:dayNumber/note", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const dayNumber = Number(req.params.dayNumber);
    const { note } = req.body;

    const arc = await Arc.findOne({ userId, status: "active" });
    if (!arc) {
      return res.status(404).json({ error: "No active Arc found" });
    }

    const day = await Day.findOne({ arcId: arc._id, userId, dayNumber });
    if (!day) {
      return res.status(404).json({ error: "Day not found" });
    }

    day.note = note || "";
    await day.save();

    res.json({ message: "Daily reflection saved successfully", day });
  } catch (err) {
    console.error("Save note error:", err);
    res.status(500).json({ error: "Failed to save reflection note" });
  }
});

// @route POST /api/days/copy-routine
router.post("/copy-routine", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { sourceDayNumber, targetDayNumbers } = req.body;

    if (!sourceDayNumber || !targetDayNumbers || !Array.isArray(targetDayNumbers)) {
      return res.status(400).json({ error: "Please provide sourceDayNumber and array of targetDayNumbers" });
    }

    const arc = await Arc.findOne({ userId, status: "active" });
    if (!arc) {
      return res.status(404).json({ error: "No active Arc found" });
    }

    const sourceDay = await Day.findOne({ arcId: arc._id, userId, dayNumber: Number(sourceDayNumber) });
    if (!sourceDay) {
      return res.status(404).json({ error: "Source day not found" });
    }

    const sourceTasks = await Task.find({ dayId: sourceDay._id });
    if (sourceTasks.length === 0) {
      return res.status(400).json({ error: "Source day has no tasks to copy" });
    }

    for (const targetDayNum of targetDayNumbers) {
      let targetDay = await Day.findOne({ arcId: arc._id, userId, dayNumber: Number(targetDayNum) });
      if (!targetDay) {
        const dDate = new Date(arc.startDate);
        dDate.setDate(dDate.getDate() + (Number(targetDayNum) - 1));
        targetDay = await Day.create({
          arcId: arc._id,
          userId,
          dayNumber: Number(targetDayNum),
          date: dDate.toISOString().split("T")[0],
          status: "pending",
          note: "",
          completionRate: 0
        });
      }

      // Clear existing pending tasks on target day
      await Task.deleteMany({ dayId: targetDay._id, status: "pending" });

      // Copy source tasks to target day
      for (let j = 0; j < sourceTasks.length; j++) {
        const st = sourceTasks[j];
        await Task.create({
          dayId: targetDay._id,
          userId,
          libraryTaskId: st.libraryTaskId,
          title: st.title,
          category: st.category,
          time: st.time,
          duration: st.duration,
          difficulty: st.difficulty,
          points: st.points,
          strict: st.strict,
          status: "pending",
          pointsEarned: 0,
          order: j
        });
      }
    }

    res.json({ message: `Routine copied from Day ${sourceDayNumber} to ${targetDayNumbers.length} days successfully!` });
  } catch (err) {
    console.error("Copy routine error:", err);
    res.status(500).json({ error: "Failed to copy routine" });
  }
});

module.exports = router;
