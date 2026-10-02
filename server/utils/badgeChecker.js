const Badge = require("../models/Badge");
const Day = require("../models/Day");
const Task = require("../models/Task");

async function checkAndAwardBadges(user) {
  const userId = user._id;
  const badgesEarned = [];

  // Check 1: First Day
  const completedTasks = await Task.countDocuments({ userId, status: "followed" });
  if (completedTasks >= 1) {
    const exists = await Badge.findOne({ userId, name: "First Day" });
    if (!exists) {
      await Badge.create({
        userId,
        name: "First Day",
        description: "Completed your first task on your FrostMode Arc!",
        icon: "❄️"
      });
      badgesEarned.push("First Day");
    }
  }

  // Check 2: 7-Day Streak
  if (user.streak >= 7) {
    const exists = await Badge.findOne({ userId, name: "7-Day Streak" });
    if (!exists) {
      await Badge.create({
        userId,
        name: "7-Day Streak",
        description: "Maintained a 7-day arc streak!",
        icon: "🔥"
      });
      badgesEarned.push("7-Day Streak");
    }
  }

  // Check 3: Early Bird
  const morningTask = await Task.findOne({ userId, category: "Morning", status: "followed" });
  if (morningTask) {
    const exists = await Badge.findOne({ userId, name: "Early Bird" });
    if (!exists) {
      await Badge.create({
        userId,
        name: "Early Bird",
        description: "Conquered a Morning task like a champion!",
        icon: "🌅"
      });
      badgesEarned.push("Early Bird");
    }
  }

  // Check 4: Perfect Week
  const perfectDaysCount = await Day.countDocuments({ userId, status: "perfect" });
  if (perfectDaysCount >= 7) {
    const exists = await Badge.findOne({ userId, name: "Perfect Week" });
    if (!exists) {
      await Badge.create({
        userId,
        name: "Perfect Week",
        description: "Completed 7 Perfect Days with 100% execution!",
        icon: "💎"
      });
      badgesEarned.push("Perfect Week");
    }
  }

  // Check 5: Iron Discipline
  if (user.strictMode && user.totalPoints >= 500) {
    const exists = await Badge.findOne({ userId, name: "Iron Discipline" });
    if (!exists) {
      await Badge.create({
        userId,
        name: "Iron Discipline",
        description: "Earned 500+ points with Strict Mode enabled!",
        icon: "🛡️"
      });
      badgesEarned.push("Iron Discipline");
    }
  }

  return badgesEarned;
}

module.exports = { checkAndAwardBadges };
