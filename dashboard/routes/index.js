const router = require('express').Router();

router.get('/', (req, res) => {
  const totalGuilds = req.client?.guilds?.cache?.size || 0;
  const totalUsers = req.client?.users?.cache?.size || 0;
  res.render('index', { user: req.user || null, totalGuilds, totalUsers });
});

router.get('/commands', (req, res) => {
  res.render('commands', { user: req.user || null });
});

router.get('/premium', (req, res) => {
  res.render('premium', { user: req.user || null });
});

module.exports = router;
