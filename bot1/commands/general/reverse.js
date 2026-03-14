const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('reverse').setDescription('🔄 عكس النص')
    .addStringOption(o => o.setName('text').setDescription('النص').setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const reversed = [...text].reverse().join('');
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle('🔄 عكس النص')
      .addFields({ name: '📥 الأصلي', value: `\`${text}\`` }, { name: '📤 المعكوس', value: `\`${reversed}\`` })] });
  }
};
