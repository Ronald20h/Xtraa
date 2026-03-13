const { dbGet, dbAll, dbRun, ensureGuild } = require('../database');
const spamMap = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    try {
      ensureGuild(message.guild.id);
      const guild = dbGet('SELECT * FROM guilds WHERE id = ?', [message.guild.id]);

      // Auto Respond
      const responds = dbAll('SELECT * FROM autorespond WHERE guild_id = ? AND enabled = 1', [message.guild.id]);
      for (const r of responds) {
        const content = message.content.toLowerCase();
        const trigger = r.trigger.toLowerCase();
        let matched = false;
        if (r.match_type === 'exact') matched = content === trigger;
        else if (r.match_type === 'contains') matched = content.includes(trigger);
        else if (r.match_type === 'startswith') matched = content.startsWith(trigger);
        if (matched) { await message.reply(r.response).catch(() => {}); break; }
      }

      // Protection (non-admin only)
      const isAdmin = message.member?.permissions.has('Administrator');
      if (!isAdmin && guild) {
        // Anti-Spam
        if (guild.anti_spam) {
          const key = `${message.guild.id}-${message.author.id}`;
          const now = Date.now();
          if (!spamMap.has(key)) spamMap.set(key, []);
          const times = spamMap.get(key).filter(t => now - t < 5000);
          times.push(now); spamMap.set(key, times);
          if (times.length >= 5) {
            await message.delete().catch(() => {});
            await message.member?.timeout(10000, 'Anti-Spam').catch(() => {});
            spamMap.delete(key); return;
          }
        }
        // Anti-Links
        if (guild.anti_links && /(https?:\/\/|www\.)\S+/gi.test(message.content)) {
          await message.delete().catch(() => {});
          const w = await message.channel.send(`<@${message.author.id}> 🔗 لا يُسمح بالروابط!`);
          setTimeout(() => w.delete().catch(() => {}), 3000); return;
        }
        // Anti-Caps
        if (guild.anti_caps && message.content.length > 10) {
          const upper = message.content.replace(/[^A-Za-z]/g, '');
          if (upper.length > 0 && (upper.split('').filter(c => c === c.toUpperCase()).length / upper.length) > 0.8) {
            await message.delete().catch(() => {}); return;
          }
        }
        // Anti-Mention
        if (guild.anti_mention && message.mentions.users.size >= 5) {
          await message.delete().catch(() => {});
          await message.member?.timeout(30000, 'Anti-Mass-Mention').catch(() => {}); return;
        }
      }

      // XP System
      const xpGain = Math.floor(Math.random() * 10) + 5;
      const existing = dbGet('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
      if (!existing) {
        dbRun('INSERT INTO levels (guild_id, user_id, xp, level, messages) VALUES (?, ?, ?, 0, 1)', [message.guild.id, message.author.id, xpGain]);
      } else {
        const newXp = existing.xp + xpGain;
        const newLevel = Math.floor(newXp / 100);
        const leveled = newLevel > existing.level;
        dbRun('UPDATE levels SET xp = ?, level = ?, messages = messages + 1 WHERE guild_id = ? AND user_id = ?', [newXp, newLevel, message.guild.id, message.author.id]);
        if (leveled && guild?.level_channel) {
          const ch = message.guild.channels.cache.get(guild.level_channel);
          const lvlMsg = (guild.level_msg || '🎉 {user} وصل للمستوى **{level}**!')
            .replace('{user}', message.author.toString()).replace('{level}', newLevel);
          if (ch) await ch.send(lvlMsg).catch(() => {});
        }
      }
    } catch (err) { /* silent */ }
  }
};
