const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('uptime').setDescription('⏰ مدة تشغيل البوت'),
  async execute(interaction) {
    const s = Math.floor(process.uptime());
    const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60), sec = s%60;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff88').setTitle('⏰ وقت التشغيل')
      .setDescription(`\`${d}\` يوم  \`${h}\` ساعة  \`${m}\` دقيقة  \`${sec}\` ثانية`)
      .addFields({ name: '💓 Ping', value: `\`${interaction.client.ws.ping}ms\``, inline: true }, { name: '🚀 منذ', value: `<t:${Math.floor((Date.now() - process.uptime()*1000)/1000)}:R>`, inline: true })] });
  }
};
