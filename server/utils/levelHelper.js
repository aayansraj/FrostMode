function calculateLevel(points) {
  if (points >= 5000) return "Winter King";
  if (points >= 3000) return "Legend";
  if (points >= 1500) return "Beast";
  if (points >= 500) return "Warrior";
  return "Beginner";
}

module.exports = { calculateLevel };
