const router = require('express').Router();
const { dbAll, dbGet, dbRun, ensureGuild } = require('../../bot/database');
require('dotenv').config();

// ─── تحقق من الأونر — يدعم OWNER_IDS و OWNER_ID ───
function isOwner(req, res, next) {
  if (!req.user) return res.redirect('/auth/login');
  const ids = (process.env.OWNER_IDS || process.env.OWNER_ID || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  if (!ids.includes(req.user.id)) return res.status(403).render('error', { error: '🔐 هذه الصفحة لأونر البوت فقط!' });
  next();
}

router.get('/', isOwner, (req, res) => {
  try {
    const client = req.client;
    const guilds = (client?.guilds?.cache || new Map());
    const guildList = [...guilds.values()].map(g => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
      memberCount: g.memberCount,
      premium: !!dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [g.id]),
    }));

    const stats = {
      guilds: guilds.size,
      users: [...guilds.values()].reduce((s, g) => s + g.memberCount, 0),
      ping: client?.ws?.ping || 0,
      uptime: process.uptime(),
    };

    res.render('owner/panel', {
      user: req.user,
      guilds: guildList,
      stats,
      query: req.query,
      botAvatar: client?.user?.displayAvatarURL({ dynamic: true }) || '',
    });
  } catch (e) {
    console.error('owner route:', e);
    res.redirect('/dashboard');
  }
});

// منح Premium
router.post('/premium/grant', isOwner, (req, res) => {
  const { guild_id, plan, expires_at } = req.body;
  if (!guild_id) return res.redirect('/owner?error=1');
  ensureGuild(guild_id);
  dbRun('INSERT OR REPLACE INTO premium_servers (guild_id, granted_by, expires_at, plan) VALUES (?,?,?,?)',
    [guild_id, req.user.id, expires_at || null, plan || 'basic']);
  dbRun('UPDATE guilds SET premium = 1 WHERE id = ?', [guild_id]);
  res.redirect('/owner?granted=1');
});

// سحب Premium
router.post('/premium/revoke', isOwner, (req, res) => {
  const { guild_id } = req.body;
  dbRun('DELETE FROM premium_servers WHERE guild_id = ?', [guild_id]);
  dbRun('UPDATE guilds SET premium = 0 WHERE id = ?', [guild_id]);
  res.redirect('/owner?revoked=1');
});

// API منح/سحب Premium
router.post('/api/premium', isOwner, (req, res) => {
  const { guildId, action, days } = req.body;
  if (!guildId) return res.json({ error: 'أدخل ID السيرفر' });
  try {
    ensureGuild(guildId);
    if (action === 'add') {
      const exp = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
      dbRun('INSERT OR REPLACE INTO premium_servers (guild_id, granted_by, expires_at, plan) VALUES (?,?,?,?)',
        [guildId, req.user.id, exp, 'basic']);
      dbRun('UPDATE guilds SET premium = 1 WHERE id = ?', [guildId]);
      return res.json({ success: true, message: `✅ تم منح Premium لـ \`${guildId}\`` });
    }
    if (action === 'remove') {
      dbRun('DELETE FROM premium_servers WHERE guild_id = ?', [guildId]);
      dbRun('UPDATE guilds SET premium = 0 WHERE id = ?', [guildId]);
      return res.json({ success: true, message: `✅ تم سحب Premium من \`${guildId}\`` });
    }
    res.json({ error: 'action غير صحيح' });
  } catch (e) { res.json({ error: e.message }); }
});

module.exports = router;
