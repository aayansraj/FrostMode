const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "frostmode_super_secret_jwt_key_2026_lock_in_level_up";

// Generate JWT token helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "30d" });
};

// @route POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, displayName, email, password } = req.body;

    if (!name || !displayName || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      displayName,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: "snowflake",
      totalPoints: 0,
      walletPoints: 0,
      level: "Beginner",
      streak: 0,
      bestStreak: 0,
      strictMode: false,
      showOnLeaderboard: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        walletPoints: user.walletPoints,
        level: user.level,
        streak: user.streak,
        bestStreak: user.bestStreak,
        strictMode: user.strictMode,
        showOnLeaderboard: user.showOnLeaderboard
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Account registered with Google OAuth. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        walletPoints: user.walletPoints,
        level: user.level,
        streak: user.streak,
        bestStreak: user.bestStreak,
        strictMode: user.strictMode,
        showOnLeaderboard: user.showOnLeaderboard
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Initialize Google OAuth Client
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { credential, idToken, email: rawEmail, name: rawName, googleId: rawGoogleId, avatar: rawAvatar } = req.body;

    let userEmail, userName, userGoogleId, userAvatar;

    const tokenToVerify = credential || idToken;

    if (tokenToVerify) {
      if (!process.env.GOOGLE_CLIENT_ID) {
        console.warn("GOOGLE_CLIENT_ID environment variable is missing on server.");
      }
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenToVerify,
          audience: process.env.GOOGLE_CLIENT_ID || undefined
        });
        const payload = ticket.getPayload();
        userEmail = payload.email;
        userName = payload.name;
        userGoogleId = payload.sub;
        userAvatar = payload.picture || "wolf";
      } catch (verifyErr) {
        console.error("Google token verification failed:", verifyErr.message);
        return res.status(401).json({ error: "Invalid Google credential or token signature." });
      }
    } else if (rawEmail) {
      // Dev / Fallback mode when raw email is passed
      userEmail = rawEmail;
      userName = rawName;
      userGoogleId = rawGoogleId || `google_${Date.now()}`;
      userAvatar = rawAvatar || "wolf";
    } else {
      return res.status(400).json({ error: "Google OAuth token or credentials are required." });
    }

    let user = await User.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      const displayName = userName ? userName.replace(/\s+/g, "") : userEmail.split("@")[0];
      user = await User.create({
        name: userName || "Frost User",
        displayName,
        email: userEmail.toLowerCase(),
        googleId: userGoogleId,
        avatar: userAvatar,
        totalPoints: 0,
        walletPoints: 0,
        level: "Beginner",
        streak: 0,
        bestStreak: 0,
        strictMode: false,
        showOnLeaderboard: true
      });
    } else if (!user.googleId) {
      // Link Google ID if user registered via email previously
      user.googleId = userGoogleId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        walletPoints: user.walletPoints,
        level: user.level,
        streak: user.streak,
        bestStreak: user.bestStreak,
        strictMode: user.strictMode,
        showOnLeaderboard: user.showOnLeaderboard
      }
    });
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// @route GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      displayName: req.user.displayName,
      email: req.user.email,
      avatar: req.user.avatar,
      totalPoints: req.user.totalPoints,
      walletPoints: req.user.walletPoints,
      level: req.user.level,
      streak: req.user.streak,
      bestStreak: req.user.bestStreak,
      strictMode: req.user.strictMode,
      showOnLeaderboard: req.user.showOnLeaderboard
    }
  });
});

module.exports = router;
