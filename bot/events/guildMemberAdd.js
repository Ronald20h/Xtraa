const { EmbedBuilder } = require('discord.js');
const { ensureGuild, dbGet } = require('../database');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    await ensureGuild(member.guild.id);
    const guild = await dbGet('SELECT * FROM guilds WHERE id = ?', [member.guild.id]);
    if (!guild?.welcome_channel) return;
    const ch = member.guild.channels.cache.get(guild.welcome_channel);
    if (!ch) return;
    const msg = (guild.welcome_message || 'أهلاً {user} في {server}! 🎉')
      .replace('{user}', member.toString())
      .replace('{server}', member.guild.name)
      .replace('{count}', member.guild.memberCount);
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎉 ${guild.lang === 'en' ? 'Welcome!' : 'أهلاً وسهلاً!'}`)
      .setDescription(msg)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: guild.lang === 'en' ? '👥 Members' : '👥 الأعضاء', value: `${member.guild.memberCount}`, inline: true },
        { name: guild.lang === 'en' ? '📅 Account Age' : '📅 تاريخ الحساب', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() || undefined })
      .setTimestamp();
    await ch.send({ content: `${member}`, embeds: [embed] }).catch(() => {});
  }
};
