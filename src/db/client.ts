import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('dietapp.db');
  }
  return db;
}

export async function initDB(): Promise<void> {
  const database = await getDB();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      activity_level TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      daily_calorie_target INTEGER NOT NULL,
      is_target_manually_set INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS food_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      image_uri TEXT,
      reference_object_type TEXT NOT NULL DEFAULT 'credit_card',
      reference_object_detected INTEGER NOT NULL DEFAULT 0,
      food_name TEXT NOT NULL,
      estimated_weight_gram REAL,
      estimated_calories INTEGER NOT NULL DEFAULT 0,
      user_calories INTEGER NOT NULL,
      confidence REAL,
      ai_reasoning_summary TEXT,
      uncertainty_note TEXT,
      user_edited INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
  `);
}
