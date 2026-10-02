const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.iigurmvwjkjsnmhhgwqq:Aayansraj%40911...@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function initSupabase() {
  console.log("⚡ Connecting to Supabase PostgreSQL database...");
  const client = new Client({ connectionString });
  await client.connect();

  console.log("⚙️ Creating database tables in Supabase...");

  // 1. Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      google_id VARCHAR(255),
      avatar VARCHAR(100) DEFAULT 'snowflake',
      total_points INT DEFAULT 0,
      wallet_points INT DEFAULT 0,
      level VARCHAR(100) DEFAULT 'Beginner',
      streak INT DEFAULT 0,
      best_streak INT DEFAULT 0,
      strict_mode BOOLEAN DEFAULT FALSE,
      show_on_leaderboard BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Arcs table
  await client.query(`
    CREATE TABLE IF NOT EXISTS arcs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) DEFAULT 'Winter Arc',
      target_days INT DEFAULT 90,
      current_day INT DEFAULT 1,
      strict_mode BOOLEAN DEFAULT FALSE,
      start_date DATE DEFAULT CURRENT_DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Days table
  await client.query(`
    CREATE TABLE IF NOT EXISTS days (
      id SERIAL PRIMARY KEY,
      arc_id INT REFERENCES arcs(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      day_number INT NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      points_earned INT DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Library Tasks table (1,000 Winter Arc Tasks)
  await client.query(`
    CREATE TABLE IF NOT EXISTS library_tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(50) NOT NULL,
      points INT NOT NULL,
      duration_mins INT DEFAULT 30,
      description TEXT,
      is_strict_eligible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. User Active Routine Tasks table
  await client.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      arc_id INT REFERENCES arcs(id) ON DELETE CASCADE,
      day_id INT REFERENCES days(id) ON DELETE CASCADE,
      library_task_id INT,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(50) NOT NULL,
      points INT NOT NULL,
      is_strict BOOLEAN DEFAULT FALSE,
      completed BOOLEAN DEFAULT FALSE,
      proof_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Points Log table
  await client.query(`
    CREATE TABLE IF NOT EXISTS points_logs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      amount INT NOT NULL,
      reason VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'earn',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Rewards table
  await client.query(`
    CREATE TABLE IF NOT EXISTS rewards (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      points_cost INT NOT NULL,
      category VARCHAR(100) DEFAULT 'Custom',
      is_claimed BOOLEAN DEFAULT FALSE,
      claimed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Supabase PostgreSQL Tables Created Successfully!");

  // Seed 1,000 Tasks into library_tasks
  const countRes = await client.query("SELECT COUNT(*) FROM library_tasks;");
  const currentCount = parseInt(countRes.rows[0].count, 10);

  if (currentCount < 1000) {
    console.log("🌱 Seeding 1,000 Winter Arc Tasks into Supabase...");
    const jsonPath = path.join(__dirname, "winter_arc_tasks.json");
    if (fs.existsSync(jsonPath)) {
      const tasksData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      
      // Clear incomplete table
      await client.query("TRUNCATE library_tasks RESTART IDENTITY CASCADE;");

      const chunkSize = 100;
      for (let i = 0; i < tasksData.length; i += chunkSize) {
        const chunk = tasksData.slice(i, i + chunkSize);
        const values = [];
        const valuePlaceholders = [];
        
        chunk.forEach((t, idx) => {
          const offset = idx * 7;
          valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
          values.push(t.title, t.category, t.difficulty, t.points, t.durationMins || 30, t.description || "", t.isStrictEligible !== false);
        });

        const queryText = `INSERT INTO library_tasks (title, category, difficulty, points, duration_mins, description, is_strict_eligible) VALUES ${valuePlaceholders.join(", ")}`;
        await client.query(queryText, values);
      }

      console.log(`🎉 Seeded ${tasksData.length} tasks into Supabase library_tasks table!`);
    }
  } else {
    console.log(`ℹ️ Supabase library_tasks already has ${currentCount} tasks.`);
  }

  // Seed Demo Leaderboard Users if users table is empty
  const userCountRes = await client.query("SELECT COUNT(*) FROM users;");
  if (parseInt(userCountRes.rows[0].count, 10) === 0) {
    console.log("🏆 Seeding Demo Warriors for Supabase Leaderboard...");
    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash("WinterArc2026!", salt);

    const demoUsers = [
      { name: "Aayans Raj", displayName: "AayansRaj", email: "aayansraj2007@gmail.com", points: 2850, streak: 18, level: "Winter God", avatar: "snowflake" },
      { name: "Vikram Rathore", displayName: "ColdValkyrie", email: "vikram@frostmode.app", points: 2420, streak: 15, level: "Ice Master", avatar: "wolf" },
      { name: "Ananya Sharma", displayName: "FrostQueen", email: "ananya@frostmode.app", points: 2150, streak: 14, level: "Ice Master", avatar: "crown" },
      { name: "Rohan Verma", displayName: "ApexPredator", email: "rohan@frostmode.app", points: 1980, streak: 12, level: "Frost Warrior", avatar: "shield" },
      { name: "Kavya Patel", displayName: "GlacierWolf", email: "kavya@frostmode.app", points: 1750, streak: 10, level: "Frost Warrior", avatar: "flame" },
      { name: "Arjun Singh", displayName: "IronWill", email: "arjun@frostmode.app", points: 1420, streak: 8, level: "Challenger", avatar: "swords" },
      { name: "Sneha Reddy", displayName: "BlizzardWarrior", email: "sneha@frostmode.app", points: 1200, streak: 7, level: "Challenger", avatar: "snowflake" },
      { name: "Rahul Gupta", displayName: "ShadowLock", email: "rahul@frostmode.app", points: 950, streak: 5, level: "Beginner", avatar: "wolf" }
    ];

    for (const u of demoUsers) {
      await client.query(
        `INSERT INTO users (name, display_name, email, password, total_points, wallet_points, level, streak, best_streak, avatar, show_on_leaderboard)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)`,
        [u.name, u.displayName, u.email, demoPassword, u.points, u.points, u.level, u.streak, u.streak, u.avatar]
      );
    }
    console.log("✅ Demo Warriors seeded into Supabase!");
  }

  await client.end();
  console.log("🚀 Supabase Initialization Completed Successfully!");
}

if (require.main === module) {
  initSupabase().catch(err => {
    console.error("❌ Supabase init error:", err);
    process.exit(1);
  });
}

module.exports = { initSupabase };
