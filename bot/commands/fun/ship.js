const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ship').setDescription('💕 نسبة التوافق بين شخصين (للمرح!)')
    .addUserOption(o => o.setName('user1').setDescription('الشخص الأول').setRequired(true))
    .addUserOption(o => o.setName('user2').setDescription('الشخص الثاني').setRequired(true)),
  async execute(interaction) {
    const u1 = interaction.options.getUser('user1');
    const u2 = interaction.options.getUser('user2');
    const pct = Math.floor(Math.random() * 101);
    const bar = '❤️'.repeat(Math.floor(pct/10)) + '🖤'.repeat(10-Math.floor(pct/10));
    const msg = pct < 30 ? 'مش مناسبين 😬' : pct < 60 ? 'ممكن 🤔' : pct < 80 ? 'جيدان 😊' : pct < 95 ? 'ممتازان 💕' : 'مثاليان تماماً! 💘';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff69b4')
      .setTitle('💕 نسبة التوافق (للمرح فقط!)')
      .setDescription(`**${u1.username}** ❤️ **${u2.username}**\n\n${bar}\n\n# ${pct}%\n${msg}`)
      .setFooter({ text: '⚠️ هذا للمرح فقط!' })] });
  }
};
