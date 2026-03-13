const router = require('express').Router();
const { dbGet, dbAll, dbRun, ensureGuild, updateGuild } = require('../../bot/database');

function isAuth(req, res, next) {
  if (req.user) return next();
  res.redirect('/auth/login');
}

router.get('/', isAuth, (req, res) => {
  try {
    const userGuilds = (req.user.guilds || []).filter(g => g.owner || (BigInt(g.permissions) & BigInt(0x8)) !== BigInt(0));
    const guildsWithBot = userGuilds.map(g => ({
      ...g, botInGuild: !!req.client.guilds.cache.get(g.id),
      iconURL: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null
    }));
    res.render('dashboard/servers', { user: req.user, guilds: guildsWithBot });
  } catch { res.render('dashboard/servers', { user: req.user, guilds: [] }); }
});

router.get('/guild/:id', isAuth, (req, res) => {
  try {
    const guildId = req.params.id;
    const userGuild = req.user.guilds?.find(g => g.id === guildId);
    if (!userGuild) return res.redirect('/dashboard');
    const botGuild = req.client.guilds.cache.get(guildId);
    if (!botGuild) return res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`);
    const guildData = ensureGuild(guildId);
    const commands = dbAll('SELECT * FROM commands WHERE guild_id = ?', [guildId]);
    const autoresponds = dbAll('SELECT * FROM autorespond WHERE guild_id = ?', [guildId]);
    const tickets = dbAll('SELECT * FROM tickets WHERE guild_id = ? ORDER BY id DESC LIMIT 10', [guildId]);
    const logs = dbAll('SELECT * FROM logs WHERE guild_id = ? ORDER BY id DESC LIMIT 10', [guildId]);
    const premium = dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [guildId]);
    const topMembers = dbAll('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT 5', [guildId]);
    const channels = botGuild.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name }));
    const roles = botGuild.roles.cache.filter(r => r.id !== guildId).map(r => ({ id: r.id, name: r.name }));
    res.render('dashboard/guild', {
      user: req.user,
      guild: { ...guildData, name: botGuild.name, icon: botGuild.iconURL(), memberCount: botGuild.memberCount, id: guildId },
      guildData, commands, autoresponds, tickets, logs, premium, topMembers, channels, roles, query: req.query
    });
  } catch (e) { console.error(e); res.redirect('/dashboard'); }
});

router.post('/guild/:id/save', isAuth, (req, res) => {
  const { lang, welcome_channel, welcome_message, log_channel, anti_spam, anti_links, anti_caps, anti_mention, max_tickets, level_channel } = req.body;
  ensureGuild(req.params.id);
  updateGuild(req.params.id, {
    lang: lang || 'ar', welcome_channel: welcome_channel || null, welcome_message: welcome_message || null,
    log_channel: log_channel || null, anti_spam: anti_spam ? 1 : 0, anti_links: anti_links ? 1 : 0,
    anti_caps: anti_caps ? 1 : 0, anti_mention: anti_mention ? 1 : 0,
    max_tickets: parseInt(max_tickets) || 5, level_channel: level_channel || null,
  });
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1`);
});

router.post('/guild/:id/autorespond/add', isAuth, (req, res) => {
  const { trigger, response, match_type } = req.body;
  if (trigger && response) dbRun('INSERT INTO autorespond (guild_id, trigger, response, match_type) VALUES (?, ?, ?, ?)', [req.params.id, trigger, response, match_type || 'exact']);
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#autorespond`);
});

router.post('/guild/:id/autorespond/delete/:rid', isAuth, (req, res) => {
  dbRun('DELETE FROM autorespond WHERE id = ? AND guild_id = ?', [req.params.rid, req.params.id]);
  res.redirect(`/dashboard/guild/${req.params.id}#autorespond`);
});

router.post('/guild/:id/command/shortcut', isAuth, (req, res) => {
  const { command_name, shortcut } = req.body;
  if (command_name && shortcut) dbRun('INSERT OR REPLACE INTO commands (guild_id, command_name, shortcut) VALUES (?, ?, ?)', [req.params.id, command_name, shortcut]);
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#commands`);
});

module.exports = router;
