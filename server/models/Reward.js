const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  cost: { type: Number, required: true },
  redeemed: { type: Boolean, default: false },
  redeemedAt: { type: Date }
});

module.exports = mongoose.model("Reward", RewardSchema);
