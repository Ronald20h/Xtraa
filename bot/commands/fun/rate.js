const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('rate').setDescription('⭐ تقييم عشوائي لأي شيء')
    .addStringOption(o => o.setName('thing').setDescription('الشيء المراد تقييمه').setRequired(true)),
  async execute(interaction) {
    const thing = interaction.options.getString('thing');
    const rating = Math.random() * 10;
    const stars = '⭐'.repeat(Math.round(rating)) + '☆'.repeat(10 - Math.round(rating));
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffd700')
      .setTitle('⭐ التقييم')
      .setDescription(`**${thing}**\n\n${stars}\n\n# ${rating.toFixed(1)} / 10`)
      .setFooter({ text: '⚠️ هذا التقييم عشوائي للمرح فقط!' })] });
  }
};
