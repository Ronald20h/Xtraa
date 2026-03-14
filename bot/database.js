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

  setInterval(() => saveDB(), 15000);
  process.on('exit', saveDB);
  process.on('SIGINT', () => { saveDB(); process.exit(); });
  process.on('SIGTERM', () => { saveDB(); process.exit(); });

  db.run(`PRAGMA journal_mode=WAL`);

  db.run(`CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY, lang TEXT DEFAULT 'ar',
    welcome_channel TEXT, welcome_message TEXT,
    welcome_bg TEXT, welcome_type TEXT DEFAULT 'embed',
    welcome_dm INTEGER DEFAULT 0, welcome_dm_msg TEXT,
    log_channel TEXT,
    ticket_category TEXT, max_tickets INTEGER DEFAULT 5,
    ticket_log_channel TEXT, ticket_button_label TEXT DEFAULT '🎫 فتح تذكرة',
    ticket_button_color TEXT DEFAULT 'Primary',
    ticket_panel_message TEXT, ticket_panel_title TEXT DEFAULT '🎫 نظام التذاكر',
    level_channel TEXT, level_msg TEXT, level_dm INTEGER DEFAULT 0,
    anti_spam INTEGER DEFAULT 0, anti_links INTEGER DEFAULT 0,
    anti_caps INTEGER DEFAULT 0, anti_mention INTEGER DEFAULT 0,
    anti_server_name INTEGER DEFAULT 0, anti_server_icon INTEGER DEFAULT 0,
    anti_raid INTEGER DEFAULT 0, protection_log_channel TEXT,
    protection_enabled INTEGER DEFAULT 1,
    original_server_name TEXT, original_server_icon TEXT,
    premium INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migrate columns
  const newCols = [
    'welcome_bg TEXT','welcome_type TEXT','welcome_dm INTEGER','welcome_dm_msg TEXT',
    'anti_server_name INTEGER','anti_server_icon INTEGER','anti_raid INTEGER',
    'protection_log_channel TEXT','protection_enabled INTEGER',
    'original_server_name TEXT','original_server_icon TEXT',
    'ticket_log_channel TEXT','ticket_button_label TEXT',
    'ticket_button_color TEXT','ticket_panel_message TEXT','ticket_panel_title TEXT',
    'level_dm INTEGER'
  ];
  for (const col of newCols) {
    try { db.run(`ALTER TABLE guilds ADD COLUMN ${col}`); } catch {}
  }

  db.run(`CREATE TABLE IF NOT EXISTS shortcuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, shortcut TEXT UNIQUE, command_name TEXT,
    args TEXT, created_by TEXT
  )`);
  try { db.run(`ALTER TABLE shortcuts ADD COLUMN guild_id TEXT`); } catch {}

  db.run(`CREATE TABLE IF NOT EXISTS commands (
    guild_id TEXT, command_name TEXT, shortcut TEXT, enabled INTEGER DEFAULT 1,
    PRIMARY KEY(guild_id, command_name)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, user_id TEXT,
    channel_id TEXT, status TEXT DEFAULT 'open', claimed_by TEXT,
    ticket_number INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, closed_at TEXT
  )`);
  try { db.run(`ALTER TABLE tickets ADD COLUMN claimed_by TEXT`); } catch {}
  try { db.run(`ALTER TABLE tickets ADD COLUMN ticket_number INTEGER DEFAULT 0`); } catch {}

  db.run(`CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT, user_id TEXT, xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0, messages INTEGER DEFAULT 0,
    PRIMARY KEY(guild_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS level_roles (
    guild_id TEXT, level INTEGER, role_id TEXT,
    PRIMARY KEY(guild_id, level)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS auto_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, role_id TEXT, type TEXT DEFAULT 'member',
    UNIQUE(guild_id, role_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS protection_whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, user_id TEXT, added_by TEXT,
    bypass_all INTEGER DEFAULT 0,
    bypass_links INTEGER DEFAULT 0, bypass_spam INTEGER DEFAULT 0,
    bypass_caps INTEGER DEFAULT 0, bypass_mentions INTEGER DEFAULT 0,
    UNIQUE(guild_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS autorespond (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, trigger TEXT,
    response TEXT, match_type TEXT DEFAULT 'exact', enabled INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS embeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, name TEXT,
    title TEXT, description TEXT, color TEXT DEFAULT '#5865F2', footer TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(guild_id, name)
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

  db.run(`CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, channel_id TEXT,
    message_id TEXT, prize TEXT, winner_count INTEGER DEFAULT 1,
    host_id TEXT, ends_at TEXT, status TEXT DEFAULT 'active',
    winners TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id INTEGER, user_id TEXT,
    UNIQUE(giveaway_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS afk (
    guild_id TEXT, user_id TEXT, reason TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(guild_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tax_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT,
    channel_id TEXT, tax_name TEXT, tax_rate INTEGER DEFAULT 10,
    enabled INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, type TEXT,
    user_id TEXT, target_id TEXT, details TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT,
    channel_id TEXT, game_type TEXT, host_id TEXT,
    players TEXT DEFAULT '[]', status TEXT DEFAULT 'waiting',
    game_data TEXT DEFAULT '{}', max_players INTEGER DEFAULT 2,
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

function dbGet(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
  stmt.free(); return null;
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
  return { changes: db.getRowsModified() };
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

function addLog(guildId, type, userId, targetId, details) {
  dbRun('INSERT INTO logs (guild_id, type, user_id, target_id, details) VALUES (?, ?, ?, ?, ?)',
    [guildId, type, userId || null, targetId || null, details || null]);
}

module.exports = { initDB, db: () => db, dbGet, dbAll, dbRun, ensureGuild, getGuild, updateGuild, addLog, saveDB };
