const mongoose = require("mongoose");

const DaySchema = new mongoose.Schema({
  arcId: { type: mongoose.Schema.Types.ObjectId, ref: "Arc", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dayNumber: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ["pending", "perfect", "partial", "missed"], default: "pending" },
  note: { type: String, default: "" },
  completionRate: { type: Number, default: 0 }
});

DaySchema.index({ userId: 1, dayNumber: 1 });
DaySchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Day", DaySchema);
