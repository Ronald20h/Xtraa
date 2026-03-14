const router = require('express').Router();
const { dbAll, dbGet } = require('../../bot/database');

router.get('/ping', (req, res) => {
  res.json({ ping: req.client?.ws?.ping || 0, uptime: process.uptime() });
});

router.get('/stats', (req, res) => {
  res.json({
    guilds: req.client?.guilds?.cache?.size || 0,
    users: req.client?.users?.cache?.size || 0,
    ping: req.client?.ws?.ping || 0,
    uptime: process.uptime()
  });
});

router.get('/guild/:id/members', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const members = dbAll('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT 50', [req.params.id]);
  res.json(members);
});

module.exports = router;
