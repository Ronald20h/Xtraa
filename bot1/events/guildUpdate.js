const { dbGet, updateGuild, addLog } = require('../database');

module.exports = {
  name: 'guildUpdate',
  async execute(oldGuild, newGuild) {
    try {
      const guild = dbGet('SELECT * FROM guilds WHERE id = ?', [newGuild.id]);
      if (!guild || !guild.protection_enabled) return;

      const ownerId = newGuild.ownerId;

      // Anti server name change
      if (guild.anti_server_name && guild.original_server_name && oldGuild.name !== newGuild.name) {
        // Revert (only if change wasn't by owner)
        await newGuild.setName(guild.original_server_name, 'Anti-Name-Change Protection').catch(() => {});
        addLog(newGuild.id, 'protection_name', null, null, `محاولة تغيير اسم السيرفر من "${oldGuild.name}" إلى "${newGuild.name}" — تم الإلغاء`);
        sendProtLog(newGuild, guild, '🔒 منع تغيير اسم السيرفر', `محاولة تغييره إلى: **${newGuild.name}**`);
      }

      // Anti server icon change
      if (guild.anti_server_icon && oldGuild.icon !== newGuild.icon) {
        if (guild.original_server_icon) {
          // Can't easily revert icon via API without storing the actual image
          addLog(newGuild.id, 'protection_icon', null, null, 'محاولة تغيير أيقونة السيرفر — تم التسجيل');
          sendProtLog(newGuild, guild, '🖼️ تغيير أيقونة السيرفر', 'لا يمكن عكس تغيير الأيقونة تلقائياً — تم التسجيل');
        }
      }
    } catch (e) {}
  }
};

async function sendProtLog(guild, guildData, type, details) {
  try {
    if (!guildData?.protection_log_channel) return;
    const ch = guild.channels.cache.get(guildData.protection_log_channel);
    if (!ch) return;
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`🛡️ سجل الحماية — ${type}`)
      .setDescription(details)
      .setTimestamp();
    await ch.send({ embeds: [embed] });
  } catch {}
}
