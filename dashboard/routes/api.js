const router = require('express').Router();
const { dbGet, ensureGuild, updateGuild } = require('../../bot/database');

function isAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

router.get('/stats', (req, res) => {
  res.json({
    guilds: req.client?.guilds?.cache?.size || 0,
    users: req.client?.users?.cache?.size || 0,
    commands: req.client?.commands?.size || 0,
    ping: req.client?.ws?.ping || 0,
    uptime: process.uptime() || 0,
  });
});

router.get('/guild/:id', isAuth, async (req, res) => {
  try {
    const g = await ensureGuild(req.params.id);
    res.json(g);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
