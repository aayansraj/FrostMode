// Run: node seedTasks.js (needs: npm i mongoose bcryptjs)
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const tasks = require("./winter_arc_tasks.json");

const LibraryTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  category: String,
  points: Number,
  strict: Boolean,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  isDefault: { type: Boolean, default: true },
});
const LibraryTask = mongoose.model("LibraryTask", LibraryTaskSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
  totalPoints: { type: Number, default: 0 },
  walletPoints: { type: Number, default: 0 },
  level: String,
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  strictMode: { type: Boolean, default: false },
  showOnLeaderboard: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

const ArcSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  startDate: { type: Date, default: Date.now },
  totalDays: { type: Number, default: 30 },
  strictMode: Boolean,
  categories: [String],
  goals: [String],
  status: { type: String, default: "active" }
});
const Arc = mongoose.model("Arc", ArcSchema);

const DaySchema = new mongoose.Schema({
  arcId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  dayNumber: Number,
  date: String,
  status: { type: String, default: "pending" },
  note: String,
  completionRate: { type: Number, default: 0 }
});
const Day = mongoose.model("Day", DaySchema);

const TaskSchema = new mongoose.Schema({
  dayId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  libraryTaskId: mongoose.Schema.Types.ObjectId,
  title: String,
  category: String,
  time: String,
  duration: Number,
  difficulty: String,
  points: Number,
  strict: Boolean,
  status: { type: String, default: "pending" },
  pointsEarned: { type: Number, default: 0 },
  order: Number
});
const Task = mongoose.model("Task", TaskSchema);

(async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/frostmode";
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);

    // 1. Seed Library Tasks
    await LibraryTask.deleteMany({ isDefault: true });
    const insertedLibraryTasks = await LibraryTask.insertMany(tasks.map(({ id, ...t }) => t));
    console.log("Seeded " + insertedLibraryTasks.length + " library tasks");

    // 2. Seed Demo Users for Leaderboard
    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash("Password123!", salt);

    const demoUsersData = [
      { name: "Alex Cold", displayName: "AlexCold", email: "alex@frostmode.app", totalPoints: 4850, walletPoints: 3200, level: "Legend", streak: 28, bestStreak: 35, strictMode: true, avatar: "wolf" },
      { name: "Frost Valkyrie", displayName: "Valkyrie", email: "valkyrie@frostmode.app", totalPoints: 3920, walletPoints: 2100, level: "Legend", streak: 21, bestStreak: 25, strictMode: true, avatar: "crown" },
      { name: "Ice King Zero", displayName: "ZeroIce", email: "zero@frostmode.app", totalPoints: 3100, walletPoints: 1950, level: "Legend", streak: 18, bestStreak: 20, strictMode: false, avatar: "ice" },
      { name: "Titan Arc", displayName: "TitanArc", email: "titan@frostmode.app", totalPoints: 2450, walletPoints: 1400, level: "Beast", streak: 14, bestStreak: 16, strictMode: true, avatar: "bear" },
      { name: "Glacier Beast", displayName: "GlacierBeast", email: "glacier@frostmode.app", totalPoints: 1800, walletPoints: 1200, level: "Beast", streak: 12, bestStreak: 12, strictMode: false, avatar: "fire" },
      { name: "Nordic Discipline", displayName: "NordicGuy", email: "nordic@frostmode.app", totalPoints: 1200, walletPoints: 800, level: "Warrior", streak: 8, bestStreak: 10, strictMode: true, avatar: "snowflake" },
      { name: "Frost Byte", displayName: "FrostByte", email: "byte@frostmode.app", totalPoints: 850, walletPoints: 500, level: "Warrior", streak: 6, bestStreak: 7, strictMode: false, avatar: "wolf" },
      { name: "Zero Degree", displayName: "ZeroDeg", email: "zerodeg@frostmode.app", totalPoints: 620, walletPoints: 400, level: "Warrior", streak: 5, bestStreak: 5, strictMode: true, avatar: "ice" },
      { name: "Chilly Arc", displayName: "ChillyArc", email: "chilly@frostmode.app", totalPoints: 380, walletPoints: 200, level: "Beginner", streak: 3, bestStreak: 3, strictMode: false, avatar: "snowflake" },
      { name: "SubZero Grind", displayName: "SubZero", email: "subzero@frostmode.app", totalPoints: 150, walletPoints: 150, level: "Beginner", streak: 1, bestStreak: 2, strictMode: false, avatar: "bear" }
    ];

    await User.deleteMany({ email: { $in: demoUsersData.map(u => u.email) } });

    const createdUsers = [];
    for (const u of demoUsersData) {
      const newUser = await User.create({
        ...u,
        password: demoPassword,
        showOnLeaderboard: true
      });
      createdUsers.push(newUser);
    }
    console.log("Seeded " + createdUsers.length + " demo users for leaderboard");

    // 3. Create Sample 30-Day Routine for Demo User (Alex Cold)
    const primaryUser = createdUsers[0];
    await Arc.deleteMany({ userId: primaryUser._id });
    await Day.deleteMany({ userId: primaryUser._id });

    const newArc = await Arc.create({
      userId: primaryUser._id,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
      totalDays: 30,
      strictMode: true,
      categories: ["Morning", "Fitness", "Study & Coding", "Mind & Mindset", "Night & Sleep"],
      goals: ["Master early wakeups", "Build 1000 point routine", "Complete 30-day Winter Arc"],
      status: "active"
    });

    // Pick 5 sample tasks from library
    const sampleLibTasks = insertedLibraryTasks.slice(0, 6);
    const times = ["05:00 AM", "06:30 AM", "09:00 AM", "02:00 PM", "08:00 PM", "10:00 PM"];

    for (let dayNum = 1; dayNum <= 30; dayNum++) {
      const dDate = new Date(newArc.startDate);
      dDate.setDate(dDate.getDate() + (dayNum - 1));
      const dateStr = dDate.toISOString().split("T")[0];

      let dayStatus = "pending";
      let completionRate = 0;

      // Mark past days (1 to 5) as perfect or partial
      if (dayNum <= 5) {
        dayStatus = dayNum % 2 === 1 ? "perfect" : "partial";
        completionRate = dayNum % 2 === 1 ? 100 : 80;
      }

      const dayObj = await Day.create({
        arcId: newArc._id,
        userId: primaryUser._id,
        dayNumber: dayNum,
        date: dateStr,
        status: dayStatus,
        note: dayNum <= 5 ? `Day ${dayNum} completed with total focus. FrostMode locked in!` : "",
        completionRate
      });

      // Add tasks to day
      for (let i = 0; i < sampleLibTasks.length; i++) {
        const lt = sampleLibTasks[i];
        let taskStatus = "pending";
        let pointsEarned = 0;

        if (dayNum <= 5) {
          if (i < 5 || dayNum % 2 === 1) {
            taskStatus = "followed";
            pointsEarned = Math.round(lt.points * 1.5);
          } else {
            taskStatus = "not_followed";
            pointsEarned = 0;
          }
        }

        await Task.create({
          dayId: dayObj._id,
          userId: primaryUser._id,
          libraryTaskId: lt._id,
          title: lt.title,
          category: lt.category,
          time: times[i] || "08:00 AM",
          duration: 30,
          difficulty: lt.difficulty,
          points: lt.points,
          strict: lt.strict,
          status: taskStatus,
          pointsEarned,
          order: i
        });
      }
    }
    console.log("Seeded sample 30-day routine for user: " + primaryUser.displayName);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
})();
