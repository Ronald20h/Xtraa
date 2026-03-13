const router = require('express').Router();
const { dbAll, dbRun } = require('../../bot/database');
require('dotenv').config();

function isOwner(req, res, next) {
  if (!req.user) return res.redirect('/auth/login');
  if (req.user.id !== process.env.OWNER_ID) return res.status(403).render('error', { error: 'Access Denied 🔐' });
  next();
}

router.get('/', isOwner, (req, res) => {
  const guilds = dbAll('SELECT * FROM guilds ORDER BY created_at DESC');
  const premiums = dbAll('SELECT * FROM premium_servers ORDER BY created_at DESC');
  res.render('owner/panel', {
    user: req.user, guilds, premiums,
    totalUsers: req.client?.users?.cache?.size || 0,
    totalGuilds: req.client?.guilds?.cache?.size || 0,
    ping: req.client?.ws?.ping || 0, query: req.query
  });
});

router.post('/premium/grant', isOwner, (req, res) => {
  const { guild_id, plan, expires_at } = req.body;
  dbRun('INSERT OR REPLACE INTO premium_servers (guild_id, granted_by, expires_at, plan) VALUES (?, ?, ?, ?)', [guild_id, req.user.id, expires_at || null, plan || 'basic']);
  dbRun('INSERT OR IGNORE INTO guilds (id) VALUES (?)', [guild_id]);
  dbRun('UPDATE guilds SET premium = 1 WHERE id = ?', [guild_id]);
  res.redirect('/owner?granted=1');
});

router.post('/premium/revoke', isOwner, (req, res) => {
  const { guild_id } = req.body;
  dbRun('DELETE FROM premium_servers WHERE guild_id = ?', [guild_id]);
  dbRun('UPDATE guilds SET premium = 0 WHERE id = ?', [guild_id]);
  res.redirect('/owner?revoked=1');
});

router.post('/broadcast', isOwner, async (req, res) => {
  const { message } = req.body;
  let sent = 0;
  for (const [, guild] of req.client.guilds.cache) {
    const ch = guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me)?.has('SendMessages'));
    if (ch) { try { await ch.send(`📢 **إعلان من Xtra Bot:**\n${message}`); sent++; } catch {} }
  }
  res.redirect(`/owner?broadcast=${sent}`);
});

module.exports = router;
