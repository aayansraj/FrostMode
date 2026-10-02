const express = require("express");
const router = express.Router();
const LibraryTask = require("../models/LibraryTask");
const Day = require("../models/Day");
const Task = require("../models/Task");
const Arc = require("../models/Arc");
const authMiddleware = require("../middleware/auth");

// @route GET /api/library
router.get("/", async (req, res) => {
  try {
    const { search, category, difficulty, strictOnly, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (difficulty && difficulty !== "All") {
      query.difficulty = difficulty;
    }

    if (strictOnly === "true") {
      query.strict = true;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const tasks = await LibraryTask.find(query)
      .sort({ category: 1, difficulty: 1, title: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await LibraryTask.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      tasks,
      total,
      page: pageNum,
      totalPages
    });
  } catch (err) {
    console.error("Get library tasks error:", err);
    res.status(500).json({ error: "Failed to fetch library tasks" });
  }
});

// @route POST /api/library/add-to-day
router.post("/add-to-day", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { libraryTaskId, customTask, targetType, targetDayNumber, time = "08:00 AM" } = req.body;

    const arc = await Arc.findOne({ userId, status: "active" });
    if (!arc) {
      return res.status(404).json({ error: "No active Arc found. Please create an Arc first." });
    }

    let taskData = {};

    if (libraryTaskId) {
      const lt = await LibraryTask.findById(libraryTaskId);
      if (!lt) return res.status(404).json({ error: "Library task not found" });
      taskData = {
        libraryTaskId: lt._id,
        title: lt.title,
        category: lt.category,
        difficulty: lt.difficulty,
        points: lt.points,
        strict: lt.strict
      };
    } else if (customTask) {
      const difficultyPoints = { easy: 10, medium: 20, hard: 30 };
      const points = customTask.points || difficultyPoints[customTask.difficulty || "medium"] || 20;
      taskData = {
        title: customTask.title,
        category: customTask.category || "Productivity",
        difficulty: customTask.difficulty || "medium",
        points,
        strict: Boolean(customTask.strict)
      };
    } else {
      return res.status(400).json({ error: "Specify libraryTaskId or customTask" });
    }

    let targetDays = [];

    if (targetType === "today") {
      const today = new Date();
      const startDate = new Date(arc.startDate);
      const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const currentDayNum = Math.max(1, Math.min(arc.totalDays, diffDays));

      let day = await Day.findOne({ arcId: arc._id, userId, dayNumber: currentDayNum });
      if (!day) {
        day = await Day.create({
          arcId: arc._id,
          userId,
          dayNumber: currentDayNum,
          date: today.toISOString().split("T")[0],
          status: "pending",
          note: "",
          completionRate: 0
        });
      }
      targetDays.push(day);
    } else if (targetType === "specific" && targetDayNumber) {
      let day = await Day.findOne({ arcId: arc._id, userId, dayNumber: Number(targetDayNumber) });
      if (!day) {
        const dDate = new Date(arc.startDate);
        dDate.setDate(dDate.getDate() + (Number(targetDayNumber) - 1));
        day = await Day.create({
          arcId: arc._id,
          userId,
          dayNumber: Number(targetDayNumber),
          date: dDate.toISOString().split("T")[0],
          status: "pending",
          note: "",
          completionRate: 0
        });
      }
      targetDays.push(day);
    } else if (targetType === "all") {
      targetDays = await Day.find({ arcId: arc._id, userId });
    }

    for (const dayObj of targetDays) {
      const taskCount = await Task.countDocuments({ dayId: dayObj._id });
      await Task.create({
        dayId: dayObj._id,
        userId,
        ...taskData,
        time,
        duration: 30,
        status: "pending",
        pointsEarned: 0,
        order: taskCount
      });
    }

    res.json({ message: `Task added to ${targetDays.length} day(s) successfully!` });
  } catch (err) {
    console.error("Add task to day error:", err);
    res.status(500).json({ error: "Failed to add task to day" });
  }
});

// @route POST /api/library/custom
router.post("/custom", authMiddleware, async (req, res) => {
  try {
    const { title, category, difficulty, strict } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const pointsMap = { easy: 10, medium: 20, hard: 30 };
    const points = pointsMap[difficulty || "medium"] || 20;

    const existing = await LibraryTask.findOne({ title });
    if (existing) {
      return res.status(400).json({ error: "A task with this title already exists in the library" });
    }

    const newTask = await LibraryTask.create({
      title,
      category: category || "Productivity",
      difficulty: difficulty || "medium",
      points,
      strict: Boolean(strict),
      isDefault: false
    });

    res.status(201).json({ message: "Custom task added to library", task: newTask });
  } catch (err) {
    console.error("Create custom task error:", err);
    res.status(500).json({ error: "Failed to create custom library task" });
  }
});

module.exports = router;
