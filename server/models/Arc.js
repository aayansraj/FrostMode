const mongoose = require("mongoose");

const ArcSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true, default: Date.now },
  totalDays: { type: Number, required: true, default: 60 },
  strictMode: { type: Boolean, default: false },
  categories: [{ type: String }],
  goals: [{ type: String }],
  status: { type: String, enum: ["active", "completed", "broken"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Arc", ArcSchema);
