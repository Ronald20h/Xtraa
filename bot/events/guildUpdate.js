const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const { dbGet, dbAll, addLog } = require('../database');

module.exports = {
  name: 'guildUpdate',
  async execute(oldGuild, newGuild) {
    try {
      const guild = dbGet('SELECT * FROM guilds WHERE id = ?', [newGuild.id]);
      if (!guild || !guild.protection_enabled) return;

      const nameChanged = oldGuild.name !== newGuild.name;
      const iconChanged = oldGuild.icon !== newGuild.icon;
      if (!nameChanged && !iconChanged) return;

      await new Promise(r => setTimeout(r, 1000));
      const logs = await newGuild.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate, limit: 1 });
      const executor = logs.entries.first()?.executor;
      if (!executor) return;

      // صاحب السيرفر مستثنى
      if (executor.id === newGuild.ownerId) return;
      // أونر البوت مستثنى
      const botOwners = (process.env.OWNER_IDS || process.env.OWNER_ID || '').split(',').map(s => s.trim());
      if (botOwners.includes(executor.id)) return;
      // وايت ليست
      const wl = dbAll('SELECT * FROM protection_whitelist WHERE guild_id = ? AND user_id = ?', [newGuild.id, executor.id]);
      if (wl.length && wl[0].bypass_all) return;
      // رتبة فوق البوت
      const member = await newGuild.members.fetch(executor.id).catch(() => null);
      const botMember = newGuild.members.cache.get(newGuild.client.user.id);
      if (member && botMember && member.roles.highest.position >= botMember.roles.highest.position) return;

      // رجّع الاسم
      if (nameChanged && guild.original_server_name) {
        await newGuild.setName(guild.original_server_name).catch(() => {});
      }
      // رجّع الأيقونة
      if (iconChanged && guild.original_server_icon) {
        await newGuild.setIcon(guild.original_server_icon).catch(() => {});
      }

      // باند فوري
      if (member) {
        const botPos = botMember?.roles.highest.position || 0;
        if (botPos > member.roles.highest.position) {
          await member.roles.remove(member.roles.cache.filter(r => r.id !== newGuild.id)).catch(() => {});
        }
        await newGuild.bans.create(executor.id, { reason: '🛡️ حماية: تغيير السيرفر' }).catch(() => {});
      }

      addLog(newGuild.id, 'protection_server', executor.id, null,
        `${nameChanged ? `تغيير الاسم: "${oldGuild.name}" → "${newGuild.name}" ` : ''}${iconChanged ? 'تغيير الأيقونة' : ''}`);
      await sendProtLog(newGuild, guild, '🛡️ تغيير السيرفر',
        `**المخالف:** <@${executor.id}>\n**العقوبة:** باند فوري\n${nameChanged ? `**الاسم:** ${oldGuild.name} ← محاولة: ${newGuild.name}\n` : ''}${iconChanged ? '**الأيقونة:** تمت الاستعادة\n' : ''}✅ تم العكس تلقائياً`);
    } catch (e) { console.error('guildUpdate protection:', e.message); }
  }
};

async function sendProtLog(guild, guildData, title, desc) {
  try {
    if (!guildData?.protection_log_channel) return;
    const ch = guild.channels.cache.get(guildData.protection_log_channel);
    if (!ch) return;
    await ch.send({ embeds: [new EmbedBuilder().setColor('#ff4444').setTitle(title).setDescription(desc).setTimestamp()] });
  } catch {}
}
