const { db } = require('../database');

function logAction(guildId, type, userId, targetId, action, details = '') {
  try {
    db.prepare('INSERT INTO logs (guild_id, type, user_id, target_id, action, details) VALUES (?, ?, ?, ?, ?, ?)')
      .run(guildId, type, userId, targetId, action, details);
  } catch(e) {}
}

module.exports = { logAction };
