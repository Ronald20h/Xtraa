const router = require('express').Router();
const { dbGet, dbAll, dbRun, ensureGuild, updateGuild, addLog } = require('../../bot/database');
const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChannelType } = require('discord.js');

function isAuth(req, res, next) {
  if (req.user) return next();
  res.redirect('/auth/login');
}

function hasGuildAccess(req, res, next) {
  const guildId = req.params.id;
  const userGuild = req.user.guilds?.find(g => g.id === guildId);
  if (!userGuild || !(userGuild.owner || (BigInt(userGuild.permissions) & BigInt(0x8)) !== BigInt(0))) {
    return res.redirect('/dashboard');
  }
  next();
}

router.get('/', isAuth, (req, res) => {
  try {
    const userGuilds = (req.user.guilds || []).filter(g => g.owner || (BigInt(g.permissions) & BigInt(0x8)) !== BigInt(0));
    const guildsWithBot = userGuilds.map(g => ({
      ...g, botInGuild: !!req.client.guilds.cache.get(g.id),
      iconURL: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
      premium: !!dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [g.id])
    }));
    res.render('dashboard/servers', { user: req.user, guilds: guildsWithBot });
  } catch { res.render('dashboard/servers', { user: req.user, guilds: [] }); }
});

router.get('/guild/:id', isAuth, hasGuildAccess, (req, res) => {
  try {
    const guildId = req.params.id;
    const botGuild = req.client.guilds.cache.get(guildId);
    if (!botGuild) return res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`);
    const guildData = ensureGuild(guildId);
    const channels = botGuild.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name })).sort((a,b) => a.name.localeCompare(b.name));
    const categories = botGuild.channels.cache.filter(c => c.type === 4).map(c => ({ id: c.id, name: c.name }));
    const roles = botGuild.roles.cache.filter(r => r.id !== guildId).map(r => ({ id: r.id, name: r.name })).sort((a,b) => b.position - a.position);
    const premium = dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [guildId]);
    const tickets = dbAll('SELECT * FROM tickets WHERE guild_id = ? ORDER BY id DESC LIMIT 20', [guildId]);
    const logs = dbAll('SELECT * FROM logs WHERE guild_id = ? ORDER BY id DESC LIMIT 20', [guildId]);
    const topMembers = dbAll('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT 10', [guildId]);
    const autoresponds = dbAll('SELECT * FROM autorespond WHERE guild_id = ? ORDER BY id DESC', [guildId]);
    const shortcuts = dbAll('SELECT * FROM shortcuts WHERE guild_id = ? ORDER BY id DESC', [guildId]);
    const autoRoles = dbAll('SELECT * FROM auto_roles WHERE guild_id = ?', [guildId]);
    const levelRoles = dbAll('SELECT * FROM level_roles WHERE guild_id = ? ORDER BY level ASC', [guildId]);
    const whitelist = dbAll('SELECT * FROM protection_whitelist WHERE guild_id = ?', [guildId]);
    res.render('dashboard/guild', {
      user: req.user,
      guild: { ...guildData, name: botGuild.name, icon: botGuild.iconURL(), memberCount: botGuild.memberCount, id: guildId },
      guildData, channels, categories, roles, premium, tickets, logs, topMembers, autoresponds,
      shortcuts, autoRoles, levelRoles, whitelist, query: req.query
    });
  } catch (e) { console.error(e); res.redirect('/dashboard'); }
});

// General save
router.post('/guild/:id/save', isAuth, hasGuildAccess, (req, res) => {
  const { lang, log_channel } = req.body;
  ensureGuild(req.params.id);
  updateGuild(req.params.id, { lang: lang || 'ar', log_channel: log_channel || null });
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#general`);
});

// Welcome save
router.post('/guild/:id/welcome/save', isAuth, hasGuildAccess, (req, res) => {
  const { welcome_channel, welcome_message, welcome_type, welcome_dm, welcome_dm_msg, welcome_bg } = req.body;
  ensureGuild(req.params.id);
  updateGuild(req.params.id, {
    welcome_channel: welcome_channel || null, welcome_message: welcome_message || null,
    welcome_type: welcome_type || 'embed', welcome_dm: welcome_dm ? 1 : 0,
    welcome_dm_msg: welcome_dm_msg || null, welcome_bg: welcome_bg || null
  });
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#welcome`);
});

// Protection save
router.post('/guild/:id/protection/save', isAuth, hasGuildAccess, (req, res) => {
  const { protection_enabled, anti_spam, anti_links, anti_caps, anti_mention, anti_server_name, anti_server_icon, anti_raid, protection_log_channel } = req.body;
  ensureGuild(req.params.id);
  const botGuild = req.client.guilds.cache.get(req.params.id);
  updateGuild(req.params.id, {
    protection_enabled: protection_enabled ? 1 : 0,
    anti_spam: anti_spam ? 1 : 0, anti_links: anti_links ? 1 : 0,
    anti_caps: anti_caps ? 1 : 0, anti_mention: anti_mention ? 1 : 0,
    anti_server_name: anti_server_name ? 1 : 0, anti_server_icon: anti_server_icon ? 1 : 0,
    anti_raid: anti_raid ? 1 : 0, protection_log_channel: protection_log_channel || null,
    original_server_name: botGuild?.name || null, original_server_icon: botGuild?.icon || null
  });
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#protection`);
});

// Whitelist add/remove
router.post('/guild/:id/whitelist/add', isAuth, hasGuildAccess, (req, res) => {
  const { user_id, bypass_all } = req.body;
  if (user_id) dbRun('INSERT OR REPLACE INTO protection_whitelist (guild_id, user_id, added_by, bypass_all) VALUES (?, ?, ?, ?)',
    [req.params.id, user_id.trim(), req.user.id, bypass_all === '1' ? 1 : 0]);
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#protection`);
});
router.post('/guild/:id/whitelist/remove/:uid', isAuth, hasGuildAccess, (req, res) => {
  dbRun('DELETE FROM protection_whitelist WHERE guild_id = ? AND user_id = ?', [req.params.id, req.params.uid]);
  res.redirect(`/dashboard/guild/${req.params.id}#protection`);
});

// Tickets save
router.post('/guild/:id/tickets/save', isAuth, hasGuildAccess, async (req, res) => {
  const { ticket_category, max_tickets, ticket_log_channel, ticket_button_label, ticket_button_color, ticket_panel_title, ticket_panel_message, panel_channel, action } = req.body;
  ensureGuild(req.params.id);
  updateGuild(req.params.id, {
    ticket_category: ticket_category || null, max_tickets: parseInt(max_tickets) || 5,
    ticket_log_channel: ticket_log_channel || null,
    ticket_button_label: ticket_button_label || '🎫 فتح تذكرة',
    ticket_button_color: ticket_button_color || 'Primary',
    ticket_panel_title: ticket_panel_title || '🎫 نظام التذاكر',
    ticket_panel_message: ticket_panel_message || null
  });
  if (action === 'publish_panel' && panel_channel) {
    try {
      const ch = req.client.guilds.cache.get(req.params.id)?.channels.cache.get(panel_channel);
      if (ch) {
        const styleMap = { Primary: 1, Success: 3, Danger: 4, Secondary: 2 };
        const embed = new EmbedBuilder().setColor('#5865F2')
          .setTitle(ticket_panel_title || '🎫 نظام التذاكر')
          .setDescription(ticket_panel_message || 'اضغط على الزر لفتح تذكرة')
          .setFooter({ text: `${ch.guild.name} • نظام التذاكر` });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_open').setLabel(ticket_button_label || '🎫 فتح تذكرة').setStyle(styleMap[ticket_button_color] || 1)
        );
        await ch.send({ embeds: [embed], components: [row] });
      }
    } catch (e) { console.error('Panel publish error:', e.message); }
  }
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#tickets`);
});

// Levels save
router.post('/guild/:id/levels/save', isAuth, hasGuildAccess, (req, res) => {
  const { level_channel, level_msg, level_notify } = req.body;
  updateGuild(req.params.id, { level_channel: level_channel || null, level_msg: level_msg || null, level_dm: level_notify === 'dm' ? 1 : 0 });
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#levels`);
});

// Level roles
router.post('/guild/:id/levels/role/add', isAuth, hasGuildAccess, (req, res) => {
  const { level, role_id } = req.body;
  if (level && role_id) dbRun('INSERT OR REPLACE INTO level_roles (guild_id, level, role_id) VALUES (?, ?, ?)', [req.params.id, parseInt(level), role_id]);
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#levels`);
});
router.post('/guild/:id/levels/role/delete/:level', isAuth, hasGuildAccess, (req, res) => {
  dbRun('DELETE FROM level_roles WHERE guild_id = ? AND level = ?', [req.params.id, req.params.level]);
  res.redirect(`/dashboard/guild/${req.params.id}#levels`);
});

// Auto roles
router.post('/guild/:id/autoroles/add', isAuth, hasGuildAccess, (req, res) => {
  const { role_id, type } = req.body;
  if (role_id) dbRun('INSERT OR IGNORE INTO auto_roles (guild_id, role_id, type) VALUES (?, ?, ?)', [req.params.id, role_id, type || 'member']);
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#autoroles`);
});
router.post('/guild/:id/autoroles/delete/:aid', isAuth, hasGuildAccess, (req, res) => {
  dbRun('DELETE FROM auto_roles WHERE id = ? AND guild_id = ?', [req.params.aid, req.params.id]);
  res.redirect(`/dashboard/guild/${req.params.id}#autoroles`);
});

// Shortcuts
router.post('/guild/:id/shortcuts/add', isAuth, hasGuildAccess, (req, res) => {
  const { shortcut, command_name } = req.body;
  if (shortcut && command_name) {
    try { dbRun('INSERT OR REPLACE INTO shortcuts (guild_id, shortcut, command_name, created_by) VALUES (?, ?, ?, ?)', [req.params.id, shortcut.trim(), command_name, req.user.id]); }
    catch(e) {}
  }
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#shortcuts`);
});
router.post('/guild/:id/shortcuts/delete/:sid', isAuth, hasGuildAccess, (req, res) => {
  dbRun('DELETE FROM shortcuts WHERE id = ? AND guild_id = ?', [req.params.sid, req.params.id]);
  res.redirect(`/dashboard/guild/${req.params.id}#shortcuts`);
});

// Autorespond
router.post('/guild/:id/autorespond/add', isAuth, hasGuildAccess, (req, res) => {
  const { trigger, response, match_type } = req.body;
  if (trigger && response) dbRun('INSERT INTO autorespond (guild_id, trigger, response, match_type) VALUES (?, ?, ?, ?)', [req.params.id, trigger, response, match_type || 'exact']);
  res.redirect(`/dashboard/guild/${req.params.id}?saved=1#autorespond`);
});
router.post('/guild/:id/autorespond/delete/:rid', isAuth, hasGuildAccess, (req, res) => {
  dbRun('DELETE FROM autorespond WHERE id = ? AND guild_id = ?', [req.params.rid, req.params.id]);
  res.redirect(`/dashboard/guild/${req.params.id}#autorespond`);
});

module.exports = router;
