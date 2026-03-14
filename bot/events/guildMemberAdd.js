const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { ensureGuild, dbGet, dbAll } = require('../database');

function makeWelcomeImage(member, guild) {
  // SVG-based welcome image (no native dependencies required)
  const name = member.user.username.replace(/[<>&"]/g, '');
  const memberCount = guild.memberCount;
  const avatar = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  // Returns null - actual image generation requires canvas
  return null;
}

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      await ensureGuild(member.guild.id);
      const guild = dbGet('SELECT * FROM guilds WHERE id = ?', [member.guild.id]);
      if (!guild) return;

      // Auto Roles
      const autoRoles = dbAll('SELECT * FROM auto_roles WHERE guild_id = ? AND type = ?',
        [member.guild.id, member.user.bot ? 'bot' : 'member']);
      for (const ar of autoRoles) {
        const role = member.guild.roles.cache.get(ar.role_id);
        if (role) await member.roles.add(role).catch(() => {});
      }

      // Welcome Message
      if (!guild.welcome_channel) return;
      const ch = member.guild.channels.cache.get(guild.welcome_channel);
      if (!ch) return;

      const msg = (guild.welcome_message || '🎉 أهلاً {user} في {server}! أنت العضو رقم {count}')
        .replace(/{user}/g, member.toString())
        .replace(/{mention}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{count}/g, member.guild.memberCount)
        .replace(/{tag}/g, member.user.tag);

      const isAr = guild.lang !== 'en';
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`✨ ${isAr ? 'أهلاً وسهلاً!' : 'Welcome!'}`)
        .setDescription(msg)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: isAr ? '👥 إجمالي الأعضاء' : '👥 Member Count', value: `\`${member.guild.memberCount}\``, inline: true },
          { name: isAr ? '📅 تاريخ إنشاء الحساب' : '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: isAr ? '🆔 المعرّف' : '🆔 User ID', value: `\`${member.user.id}\``, inline: true }
        )
        .setImage(guild.welcome_bg || null)
        .setFooter({ text: `${member.guild.name} • ${isAr ? 'نظام الترحيب' : 'Welcome System'}`, iconURL: member.guild.iconURL() || undefined })
        .setTimestamp();

      await ch.send({ content: `${member}`, embeds: [embed] }).catch(() => {});

      // DM Welcome
      if (guild.welcome_dm && guild.welcome_dm_msg) {
        const dmMsg = guild.welcome_dm_msg
          .replace(/{user}/g, member.user.username)
          .replace(/{server}/g, member.guild.name)
          .replace(/{count}/g, member.guild.memberCount);
        await member.send(dmMsg).catch(() => {});
      }
    } catch (err) { console.error('guildMemberAdd error:', err.message); }
  }
};
