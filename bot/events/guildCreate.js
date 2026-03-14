const { EmbedBuilder } = require('discord.js');
const { ensureGuild, updateGuild } = require('../database');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      ensureGuild(guild.id);
      // Save original server name and icon for protection
      updateGuild(guild.id, {
        original_server_name: guild.name,
        original_server_icon: guild.icon || null
      });

      // Find best channel to send setup message
      const ch = guild.channels.cache
        .filter(c => c.type === 0 && c.permissionsFor(guild.members.me)?.has('SendMessages'))
        .sort((a, b) => a.position - b.position)
        .first();

      if (!ch) return;

      const dashURL = process.env.BASE_URL || 'https://your-dashboard.railway.app';
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('⚡ شكراً لإضافة Xtra Bot!')
        .setDescription([
          '> أهلاً بك في **Xtra Bot** — أقوى بوت ديسكورد عربي!',
          '',
          '**🚀 للبدء:**',
          `ادخل على الداشبورد من الرابط أدناه وقم بضبط إعدادات سيرفرك`,
          '',
          '**📋 ميزات البوت:**',
          '`🎫` نظام تذاكر متكامل',
          '`🛡️` حماية قصوى للسيرفر',
          '`📊` نظام مستويات وXP',
          '`🤖` ردود تلقائية',
          '`🎮` ألعاب تفاعلية',
          '`💎` ميزات البريميوم',
          '',
          '> اكتب `/help` لرؤية جميع الأوامر'
        ].join('\n'))
        .setThumbnail(guild.client.user.displayAvatarURL())
        .addFields(
          { name: '🌐 الداشبورد', value: `[اضغط هنا](${dashURL}/dashboard)`, inline: true },
          { name: '💬 الدعم', value: '[سيرفر الدعم](https://discord.gg/7UtgNs6xfK)', inline: true }
        )
        .setFooter({ text: `Xtra Bot v2.0 • ${guild.name}` })
        .setTimestamp();

      await ch.send({ embeds: [embed] });
    } catch (e) { console.error('guildCreate error:', e.message); }
  }
};
