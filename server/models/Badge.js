const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "🏆" },
  earnedAt: { type: Date, default: Date.now }
});

BadgeSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Badge", BadgeSchema);
