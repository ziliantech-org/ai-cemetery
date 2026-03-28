import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cemetery.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('busy_timeout = 5000');

    _db.exec(`
      CREATE TABLE IF NOT EXISTS counters (
        model_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('candles', 'flowers', 'respects', 'incense')),
        count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (model_id, type)
      );

      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS user_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        model_id TEXT NOT NULL,
        action_type TEXT NOT NULL CHECK(action_type IN ('candles', 'flowers', 'respects', 'incense')),
        action_date TEXT NOT NULL DEFAULT (date('now')),
        UNIQUE(user_id, model_id, action_type, action_date)
      );

      CREATE TABLE IF NOT EXISTS eulogies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        parent_id INTEGER REFERENCES eulogies(id),
        text TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_eulogies_model
        ON eulogies(model_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_eulogies_parent
        ON eulogies(parent_id);

      CREATE INDEX IF NOT EXISTS idx_sessions_token
        ON sessions(token);

      CREATE INDEX IF NOT EXISTS idx_user_actions_lookup
        ON user_actions(user_id, model_id, action_type, action_date);

      INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0);
    `);
  }
  return _db;
}

// --- Counter operations ---

export type CounterType = 'candles' | 'flowers' | 'respects' | 'incense';

export function incrementCounter(modelId: string, type: CounterType): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO counters (model_id, type, count) VALUES (?, ?, 1)
    ON CONFLICT(model_id, type) DO UPDATE SET count = count + 1
    RETURNING count
  `);
  const row = stmt.get(modelId, type) as { count: number };
  return row.count;
}

export function getCounter(modelId: string, type: CounterType): number {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT count FROM counters WHERE model_id = ? AND type = ?'
  );
  const row = stmt.get(modelId, type) as { count: number } | undefined;
  return row?.count ?? 0;
}

export function getAllCounters(modelId: string): Record<string, number> {
  const db = getDb();
  const stmt = db.prepare('SELECT type, count FROM counters WHERE model_id = ?');
  const rows = stmt.all(modelId) as { type: string; count: number }[];
  const result: Record<string, number> = { candles: 0, flowers: 0, respects: 0, incense: 0 };
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

// --- User operations ---

export interface UserRow {
  id: number;
  email: string;
  created_at: string;
}

export function findOrCreateUser(email: string): UserRow {
  const db = getDb();
  const find = db.prepare('SELECT id, email, created_at FROM users WHERE email = ?');
  const existing = find.get(email) as UserRow | undefined;
  if (existing) return existing;

  const insert = db.prepare(
    'INSERT INTO users (email) VALUES (?) RETURNING id, email, created_at'
  );
  return insert.get(email) as UserRow;
}

export function getUserById(id: number): UserRow | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?');
  return stmt.get(id) as UserRow | undefined;
}

// --- Verification code operations ---

export function createVerificationCode(email: string, code: string, expiresMinutes = 10): void {
  const db = getDb();
  // Invalidate previous unused codes for this email
  db.prepare(
    "UPDATE verification_codes SET used = 1 WHERE email = ? AND used = 0"
  ).run(email);

  db.prepare(
    "INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, datetime('now', '+' || ? || ' minutes'))"
  ).run(email, code, expiresMinutes);
}

export function verifyCode(email: string, code: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id FROM verification_codes
    WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `);
  const row = stmt.get(email, code) as { id: number } | undefined;
  if (!row) return false;

  db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(row.id);
  return true;
}

// --- Session operations ---

export function createSession(userId: number, token: string, expiresDays = 7): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+' || ? || ' days'))"
  ).run(token, userId, expiresDays);
}

export function getSessionUser(token: string): UserRow | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT u.id, u.email, u.created_at
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `);
  return stmt.get(token) as UserRow | undefined;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// --- User action / rate limiting ---

export function hasActedToday(
  userId: number,
  modelId: string,
  actionType: CounterType
): boolean {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT 1 FROM user_actions WHERE user_id = ? AND model_id = ? AND action_type = ? AND action_date = date('now')"
  );
  return !!stmt.get(userId, modelId, actionType);
}

export function recordAction(
  userId: number,
  modelId: string,
  actionType: CounterType
): void {
  const db = getDb();
  db.prepare(
    'INSERT OR IGNORE INTO user_actions (user_id, model_id, action_type) VALUES (?, ?, ?)'
  ).run(userId, modelId, actionType);
}

// --- Eulogy operations ---

export interface EulogyRow {
  id: number;
  model_id: string;
  user_id: number | null;
  user_email: string | null;
  parent_id: number | null;
  text: string;
  created_at: string;
}

export function addEulogy(
  modelId: string,
  text: string,
  userId: number,
  parentId?: number
): EulogyRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO eulogies (model_id, text, user_id, parent_id) VALUES (?, ?, ?, ?)
    RETURNING id, model_id, user_id, parent_id, text, created_at
  `);
  const row = stmt.get(modelId, text.slice(0, 280), userId, parentId ?? null) as EulogyRow;
  const user = getUserById(userId);
  return { ...row, user_email: user?.email ?? null };
}

export function getEulogies(modelId: string, count = 50): EulogyRow[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT e.id, e.model_id, e.user_id, e.parent_id, e.text, e.created_at,
           u.email as user_email
    FROM eulogies e
    LEFT JOIN users u ON e.user_id = u.id
    WHERE e.model_id = ?
    ORDER BY e.created_at DESC
    LIMIT ?
  `);
  return stmt.all(modelId, count) as EulogyRow[];
}
