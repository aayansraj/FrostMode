const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const arcRoutes = require("./routes/arc");
const daysRoutes = require("./routes/days");
const libraryRoutes = require("./routes/library");
const tasksRoutes = require("./routes/tasks");
const pointsRoutes = require("./routes/points");
const leaderboardRoutes = require("./routes/leaderboard");
const rewardsRoutes = require("./routes/rewards");
const analyticsRoutes = require("./routes/analytics");
const settingsRoutes = require("./routes/settings");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach socket.io instance to app
app.set("socketio", io);

// Database connections (MongoDB & Supabase PostgreSQL)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/frostmode";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🍃 Connected to MongoDB database: frostmode"))
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

const { initSupabase } = require("./initPostgres");
initSupabase()
  .then(() => console.log("⚡ Supabase PostgreSQL Database Connected & Initialized!"))
  .catch((err) => console.error("❌ Supabase DB Connection Warning:", err.message));

// Socket.io event handling
io.on("connection", (socket) => {
  console.log("New client connected to Socket.io:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/arc", arcRoutes);
app.use("/api/days", daysRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "FrostMode API Server", timestamp: new Date() });
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`❄️ FrostMode Server running on port ${PORT}`);
});
