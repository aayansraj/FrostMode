const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String, default: "snowflake" },
  totalPoints: { type: Number, default: 0 },
  walletPoints: { type: Number, default: 0 },
  level: { type: String, default: "Beginner" },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  strictMode: { type: Boolean, default: false },
  showOnLeaderboard: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);