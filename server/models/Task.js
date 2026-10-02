const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  dayId: { type: mongoose.Schema.Types.ObjectId, ref: "Day", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  libraryTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryTask" },
  title: { type: String, required: true },
  category: { type: String, required: true },
  time: { type: String, default: "08:00 AM" },
  duration: { type: Number, default: 30 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  points: { type: Number, default: 20 },
  strict: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "followed", "not_followed"], default: "pending" },
  pointsEarned: { type: Number, default: 0 },
  completedAt: { type: Date },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model("Task", TaskSchema);
