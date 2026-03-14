const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('dice').setDescription('رمي النرد / Roll dice')
    .addIntegerOption(o => o.setName('sides').setDescription('عدد الأوجه (افتراضي 6)').setMinValue(2).setMaxValue(100)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🎲 رمية النرد')
      .setDescription(`🎲 حصلت على: **${result}** / ${sides}`)] });
  }
};
