const router = require('express').Router();
require('dotenv').config();

function checkIsOwner(userId) {
  if (!userId) return false;
  const ids = (process.env.OWNER_IDS || process.env.OWNER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
  return ids.includes(userId);
}

router.get('/', (req, res) => {
  const client = req.client;
  const stats = {
    guilds: client?.guilds?.cache?.size || 0,
    users: client?.users?.cache?.size || 0,
    ping: client?.ws?.ping || 0,
  };
  res.render('index', {
    user: req.user || null,
    isOwner: req.user ? checkIsOwner(req.user.id) : false,
    stats,
    botAvatar: client?.user?.displayAvatarURL({ dynamic: true }) || '',
    botName: client?.user?.username || 'Xtra Bot',
  });
});

router.get('/commands', (req, res) => {
  res.render('commands', { user: req.user || null, isOwner: req.user ? checkIsOwner(req.user.id) : false });
});

router.get('/premium', (req, res) => {
  res.render('premium', { user: req.user || null, isOwner: req.user ? checkIsOwner(req.user.id) : false });
});

module.exports = router;
