
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hackathon.db');
const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT,
    team_id TEXT,
    track TEXT,
    filename TEXT,
    upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    original_score INTEGER,
    final_score INTEGER,
    ai_verdict TEXT,
    admin_verdict TEXT,
    evaluation_json TEXT, -- Stores full JSON result from AI
    status TEXT DEFAULT 'pending' -- pending, shortlisted, rejected, hold
  );
`);

// Safe Migrations for existing DBs
try { db.exec("ALTER TABLE submissions ADD COLUMN team_id TEXT"); } catch (e) { }
try { db.exec("ALTER TABLE submissions ADD COLUMN track TEXT"); } catch (e) { }

db.exec(`
  CREATE TABLE IF NOT EXISTS blueprint(
  id INTEGER PRIMARY KEY CHECK(id = 1),
  criteria_json TEXT
);

--Insert default blueprint if not exists
  INSERT OR IGNORE INTO blueprint(id, criteria_json) VALUES(1, '{
    "problem_understanding": { "weight": 30 },
  "solution_approach": { "weight": 30 },
  "innovation": { "weight": 30 },
  "technical_feasibility": { "weight": 30 },
  "presentation_quality": { "weight": 30 }
  }');
`);

// Force update blueprint to new 150-point scale for existing users
db.exec(`update blueprint set criteria_json = '{
    "problem_understanding": { "weight": 30 },
  "solution_approach": { "weight": 30 },
  "innovation": { "weight": 30 },
  "technical_feasibility": { "weight": 30 },
  "presentation_quality": { "weight": 30 }
}' where id = 1`);

export default db;
