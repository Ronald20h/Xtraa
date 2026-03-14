const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('iq').setDescription('🧠 احسب IQ شخص (للمرح فقط!)')
    .addUserOption(o => o.setName('user').setDescription('الشخص')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const iq = Math.floor(Math.random() * 141) + 60;
    const levels = iq < 80 ? '🥔 الذكاء البطاطا' : iq < 100 ? '😐 ذكاء عادي' : iq < 120 ? '😊 ذكاء فوق المتوسط' : iq < 140 ? '🧠 ذكاء عالٍ' : '🚀 عبقري!';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#9b59b6')
      .setTitle('🧠 قياس الذكاء (للمرح فقط!)')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${user.username}** لديه IQ:\n\n# ${iq}\n${levels}`)
      .setFooter({ text: '⚠️ هذا للمرح فقط!' })] });
  }
};
