const mongoose = require("mongoose");

const LibraryTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  points: { type: Number, required: true },
  strict: { type: Boolean, default: false },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  isDefault: { type: Boolean, default: true }
});

module.exports = mongoose.model("LibraryTask", LibraryTaskSchema);
