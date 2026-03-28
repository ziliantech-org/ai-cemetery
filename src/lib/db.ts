import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cemetery.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('busy_timeout = 5000');

    // Create tables
    _db.exec(`
      CREATE TABLE IF NOT EXISTS counters (
        model_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('candles', 'flowers', 'respects')),
        count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (model_id, type)
      );

      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS eulogies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_eulogies_model
        ON eulogies(model_id, created_at DESC);

      INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0);
    `);
  }
  return _db;
}

// --- Counter operations ---

export function incrementCounter(
  modelId: string,
  type: 'candles' | 'flowers' | 'respects'
): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO counters (model_id, type, count) VALUES (?, ?, 1)
    ON CONFLICT(model_id, type) DO UPDATE SET count = count + 1
    RETURNING count
  `);
  const row = stmt.get(modelId, type) as { count: number };
  return row.count;
}

export function getCounter(
  modelId: string,
  type: 'candles' | 'flowers' | 'respects'
): number {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT count FROM counters WHERE model_id = ? AND type = ?'
  );
  const row = stmt.get(modelId, type) as { count: number } | undefined;
  return row?.count ?? 0;
}

export function getAllCounters(
  modelId: string
): Record<string, number> {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT type, count FROM counters WHERE model_id = ?'
  );
  const rows = stmt.all(modelId) as { type: string; count: number }[];
  const result: Record<string, number> = { candles: 0, flowers: 0, respects: 0 };
  for (const row of rows) {
    result[row.type] = row.count;
  }
  return result;
}

// --- Visitor operations ---

export function incrementVisitors(): number {
  const db = getDb();
  const stmt = db.prepare(
    'UPDATE visitors SET count = count + 1 WHERE id = 1 RETURNING count'
  );
  const row = stmt.get() as { count: number };
  return row.count;
}

export function getVisitors(): number {
  const db = getDb();
  const stmt = db.prepare('SELECT count FROM visitors WHERE id = 1');
  const row = stmt.get() as { count: number };
  return row.count;
}

// --- Eulogy operations ---

export interface EulogyRow {
  id: number;
  model_id: string;
  text: string;
  created_at: string;
}

export function addEulogy(modelId: string, text: string): EulogyRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO eulogies (model_id, text) VALUES (?, ?)
    RETURNING id, model_id, text, created_at
  `);
  return stmt.get(modelId, text.slice(0, 280)) as EulogyRow;
}

export function getEulogies(modelId: string, count = 20): EulogyRow[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, model_id, text, created_at
    FROM eulogies
    WHERE model_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(modelId, count) as EulogyRow[];
}
