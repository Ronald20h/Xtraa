const { EmbedBuilder } = require('discord.js');
const { ensureGuild } = require('../database');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    await ensureGuild(guild.id);
    console.log(`➕ Joined: ${guild.name} (${guild.id})`);
    try {
      const me = await guild.members.fetchMe();
      await me.setNickname(guild.name).catch(() => {});
    } catch {}
    const ch = guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me)?.has('SendMessages'));
    if (ch) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2').setTitle('👋 مرحباً! أنا Xtra Bot')
        .setDescription('شكراً لإضافتي! 🎉\n\nاستخدم `/help` لعرض جميع الأوامر\nUse `/help` to see all commands')
        .addFields(
          { name: '📋 الأوامر', value: '`/help`', inline: true },
          { name: '⚙️ الإعداد', value: '`/setwelcome` `/setlog`', inline: true },
          { name: '📱 الدعم', value: '[واتساب](https://wa.me/201069181060) | [ديسكورد](https://discord.gg/7UtgNs6xfK)', inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: 'Xtra Bot • Developed by STEVEN ❤️' });
      await ch.send({ embeds: [embed] }).catch(() => {});
    }
  }
};
