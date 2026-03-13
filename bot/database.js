const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const DB_PATH = path.join(dataDir, 'xtra.db');

let db = null;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Save to file periodically
  setInterval(() => saveDB(), 30000);
  process.on('exit', saveDB);
  process.on('SIGINT', () => { saveDB(); process.exit(); });

  db.run(`PRAGMA journal_mode=WAL`);

  db.run(`CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY, lang TEXT DEFAULT 'ar',
    welcome_channel TEXT, welcome_message TEXT,
    log_channel TEXT, ticket_category TEXT,
    max_tickets INTEGER DEFAULT 5, ticket_count INTEGER DEFAULT 0,
    level_channel TEXT, level_msg TEXT,
    anti_spam INTEGER DEFAULT 0, anti_links INTEGER DEFAULT 0,
    anti_caps INTEGER DEFAULT 0, anti_mention INTEGER DEFAULT 0,
    premium INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS commands (
    guild_id TEXT, command_name TEXT, shortcut TEXT, enabled INTEGER DEFAULT 1,
    PRIMARY KEY(guild_id, command_name)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, user_id TEXT,
    channel_id TEXT, status TEXT DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, closed_at TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT, user_id TEXT, xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0, messages INTEGER DEFAULT 0,
    PRIMARY KEY(guild_id, user_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS autorespond (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, trigger TEXT,
    response TEXT, match_type TEXT DEFAULT 'exact', enabled INTEGER DEFAULT 1
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS embeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, name TEXT UNIQUE,
    title TEXT, description TEXT, color TEXT DEFAULT '#5865F2', footer TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, user_id TEXT,
    moderator_id TEXT, reason TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS premium_servers (
    guild_id TEXT PRIMARY KEY, granted_by TEXT, expires_at TEXT,
    plan TEXT DEFAULT 'basic', created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS game_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, game_name TEXT,
    image_url TEXT, UNIQUE(guild_id, game_name)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, type TEXT,
    user_id TEXT, target_id TEXT, details TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  saveDB();
  console.log('✅ Database initialized');
  return db;
}

function saveDB() {
  if (!db) return;
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {}
}

// Sync helpers using sql.js
function dbGet(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function dbAll(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  const rows = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function dbRun(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  db.run(sql, params);
  saveDB();
  return { changes: db.getRowsModified(), lastID: null };
}

function ensureGuild(guildId) {
  dbRun('INSERT OR IGNORE INTO guilds (id) VALUES (?)', [guildId]);
  return dbGet('SELECT * FROM guilds WHERE id = ?', [guildId]);
}

function getGuild(guildId) {
  return dbGet('SELECT * FROM guilds WHERE id = ?', [guildId]);
}

function updateGuild(guildId, updates) {
  const keys = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(updates), guildId];
  dbRun(`UPDATE guilds SET ${keys} WHERE id = ?`, vals);
}

module.exports = { initDB, db: () => db, dbGet, dbAll, dbRun, ensureGuild, getGuild, updateGuild };
