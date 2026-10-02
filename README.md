# FrostMode ❄️⚡

> **Tagline:** *"Lock In. Level Up."*

**FrostMode** is a full-stack, responsive Winter Arc daily routine tracking web application. Designed for total mental discipline, task tracking, Strict Mode lock-in, reward points, and a live real-time leaderboard.

---

## 🚀 Key Features

1. **Winter Arc Master Task Library (1,000 Tasks)**
   - 1,000 pre-built routine tasks stored in `winter_arc_tasks.json` across 10 categories (Morning, Fitness, Diet & Health, Study & Coding, Skills & Career, Mind & Mindset, Digital Detox, Productivity, Finance & Life, Night & Sleep).
   - Search by title, filter by category, difficulty, or strict tasks.
   - 1-Click "Add to Today", "Add to Day X", or "Add to All Days".
   - Support for custom task creation (Easy = 10, Medium = 20, Hard = 30 pts).

2. **Day-by-Day Timeline Routine**
   - View every day in your Arc (Day 1 to Day N).
   - Track task status: ✅ Followed (Completed), ❌ Not Followed (Skipped/Missed), ⏳ Pending.
   - Progress bar, completion rate, and day status tags ("Perfect Day", "Partial Day", "Missed Day").
   - Routine copy tool (copy one day's routine to all remaining days).
   - Daily reflection journal for end-of-day notes.

3. **Strict Mode Lock-In 🔥**
   - Toggle Strict Mode on onboarding or settings.
   - **Rules:**
     - Past days and active completed tasks are locked.
     - 1.5x Bonus points multiplier for completed tasks.
     - Missed tasks incur point penalties.
     - Missing strict tasks (`strict: true`) gives **double penalty**.
     - Missing 3 tasks in a day triggers "Arc Broken" and resets streak to 0!
     - Disabling Strict Mode imposes a 100-point penalty confirmation.

4. **Points & Rewards Wallet**
   - **Leaderboard Points** (Total earned points) vs **Spendable Wallet Points**.
   - Discipline Levels: **Beginner** → **Warrior** (500 pts) → **Beast** (1500 pts) → **Legend** (3000 pts) → **Winter King** (5000 pts).
   - **Custom Rewards Store:** Users create custom rewards (e.g. "Watch a movie = 200 pts") and redeem them using spendable wallet points without dropping leaderboard rank.
   - Badges: First Day, 7-Day Streak, Early Bird, Perfect Week, Iron Discipline.

5. **Real-Time Leaderboard 🏆**
   - Top 3 Podium (🥇 🥈 🥉) with custom avatars, levels, and streaks.
   - Filter by All Time / Today / This Week / This Month and Strict Mode users.
   - Live updates via Socket.io when any user completes tasks.
   - Current user rank banner and points needed to reach next rank.
   - Privacy toggle: "Show my name" or "Appear as Anonymous".

6. **Analytics & Data Export**
   - Category completion breakdown.
   - Day of week execution performance.
   - Points trend timeline chart.
   - Export full task and points log as CSV data.

7. **PWA Ready & Dark Winter Theme**
   - Cold navy/ice blue dark theme by default with light mode toggle.
   - Ambient falling snow background animation.
   - Installable PWA manifest & Service Worker.

---

## 🛠️ Tech Stack & Prerequisites

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti
- **Backend:** Node.js, Express, Socket.io, JWT, Bcryptjs
- **Database:** MongoDB (Mongoose)
- **Database Name:** `frostmode`

---

## 📦 Setup & Run Instructions

### 1. Database & Seeding
Ensure MongoDB is running locally at `mongodb://127.0.0.1:27017/frostmode`.

Seed the database with all 1,000 tasks, 10 demo users, and a sample 30-day routine:
```bash
cd server
npm run seed  # or node seedTasks.js
```

### 2. Start the Backend Server
```bash
cd server
npm start    # or node index.js (runs on port 5050)
```

### 3. Start the Frontend Client
In a separate terminal window:
```bash
cd client
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📂 Project Structure

```
FrostMode/
├── client/                 # React + Tailwind CSS Frontend
│   ├── public/             # PWA Manifest, Service Worker, Snowflake icon
│   └── src/
│       ├── components/     # Navbar, Footer, TaskCard, Podium, Heatmap, Modals
│       ├── context/        # AuthContext, ThemeContext
│       ├── pages/          # Landing, Auth, ArcSetup, Dashboard, Routine, Library, Leaderboard, Wallet, Analytics, Settings
│       ├── App.jsx
│       └── main.jsx
├── server/                 # Express + Node.js + Socket.io Backend
│   ├── models/             # User, Arc, Day, LibraryTask, Task, PointsLog, Reward, Badge
│   ├── routes/             # auth, arc, days, library, tasks, points, leaderboard, rewards, analytics, settings
│   ├── middleware/         # auth.js (JWT)
│   ├── utils/              # levelHelper.js, badgeChecker.js
│   ├── seedTasks.js        # Data seed script
│   ├── winter_arc_tasks.json # 1000 master task library dataset
│   ├── .env
│   └── index.js
└── README.md
```
