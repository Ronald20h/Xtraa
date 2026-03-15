const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { ensureGuild, dbGet, dbAll, addLog } = require('../database');

const raidTracker = new Map(); // guildId → [timestamps]

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      await ensureGuild(member.guild.id);
      const guild = dbGet('SELECT * FROM guilds WHERE id = ?', [member.guild.id]);
      if (!guild) return;

      // ══ حماية من البوتات ══
      if (member.user.bot && guild.protection_enabled) {
        await new Promise(r => setTimeout(r, 800));
        const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
        const executor = logs.entries.first()?.executor;

        // تحقق لو من أضافه مستثنى
        let exempt = false;
        if (executor) {
          if (executor.id === member.guild.ownerId) exempt = true;
          const botOwners = (process.env.OWNER_IDS || process.env.OWNER_ID || '').split(',').map(s => s.trim());
          if (botOwners.includes(executor.id)) exempt = true;
          const wl = dbGet('SELECT * FROM protection_whitelist WHERE guild_id = ? AND user_id = ?', [member.guild.id, executor.id]);
          if (wl?.bypass_all) exempt = true;
        }

        if (!exempt) {
          await member.kick('🛡️ Anti-Bots').catch(() => {});
          if (executor && !exempt) {
            await member.guild.bans.create(executor.id, { reason: '🛡️ إضافة بوت غير مصرح' }).catch(() => {});
          }
          addLog(member.guild.id, 'protection_bot', executor?.id || null, member.id, `طرد بوت: ${member.user.tag}`);
          await sendProtLog(member.guild, guild, '🤖 بوت غير مصرح',
            `**البوت:** ${member.user.tag}\n**أضافه:** ${executor ? `<@${executor.id}>` : 'غير معروف'}\n**الإجراء:** طرد البوت + باند من أضافه`);
          return;
        }
      }

      // ══ Anti-Raid ══
      if (guild.protection_enabled && guild.anti_raid) {
        const key = member.guild.id;
        const now = Date.now();
        if (!raidTracker.has(key)) raidTracker.set(key, []);
        const times = raidTracker.get(key).filter(t => now - t < 10000);
        times.push(now);
        raidTracker.set(key, times);
        if (times.length >= 10) {
          // ريد مكتشف
          await member.kick('🛡️ Anti-Raid').catch(() => {});
          addLog(member.guild.id, 'protection_raid', null, member.id, `Raid detected: ${times.length} joins in 10s`);
          await sendProtLog(member.guild, guild, '⚡ تحذير ريد!',
            `تم اكتشاف **${times.length}** عضو انضموا في 10 ثوان!\nتم طرد **${member.user.tag}** تلقائياً`);
          return;
        }
      }

      // ══ رتب تلقائية ══
      const autoRoles = dbAll('SELECT * FROM auto_roles WHERE guild_id = ? AND type = ?',
        [member.guild.id, member.user.bot ? 'bot' : 'member']);
      for (const ar of autoRoles) {
        const role = member.guild.roles.cache.get(ar.role_id);
        if (role) await member.roles.add(role).catch(() => {});
      }

      // ══ رسالة ترحيب ══
      if (!guild.welcome_channel) return;
      const ch = member.guild.channels.cache.get(guild.welcome_channel);
      if (!ch) return;

      const msg = (guild.welcome_message || '🎉 أهلاً {user} في {server}! أنت العضو رقم {count}')
        .replace(/{user}/g, member.toString())
        .replace(/{mention}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{count}/g, member.guild.memberCount)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{id}/g, member.user.id);

      const isAr = guild.lang !== 'en';
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`✨ ${isAr ? 'أهلاً وسهلاً!' : 'Welcome!'}`)
        .setDescription(msg)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: isAr ? '👥 إجمالي الأعضاء' : '👥 Members', value: `\`${member.guild.memberCount}\``, inline: true },
          { name: isAr ? '📅 إنشاء الحساب' : '📅 Created', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, inline: true },
          { name: isAr ? '🆔 المعرّف' : '🆔 ID', value: `\`${member.user.id}\``, inline: true }
        )
        .setImage(guild.welcome_bg || null)
        .setFooter({ text: `${member.guild.name}`, iconURL: member.guild.iconURL() || undefined })
        .setTimestamp();

      await ch.send({ content: `${member}`, embeds: [embed] }).catch(() => {});

      if (guild.welcome_dm && guild.welcome_dm_msg) {
        const dmMsg = guild.welcome_dm_msg
          .replace(/{user}/g, member.user.username)
          .replace(/{server}/g, member.guild.name);
        await member.send(dmMsg).catch(() => {});
      }
    } catch (err) { console.error('guildMemberAdd error:', err.message); }
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
