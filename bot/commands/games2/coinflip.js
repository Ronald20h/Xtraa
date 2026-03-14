const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('coinflip').setDescription('🪙 رمي عملة')
    .addStringOption(o => o.setName('choice').setDescription('اختيارك: heads/tails').setRequired(false)),
  async execute(interaction) {
    const choice = interaction.options.getString('choice');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = !choice || choice === result;
    const embed = new EmbedBuilder()
      .setColor(won ? '#ffd700' : '#ff4444')
      .setTitle('🪙 رمي العملة')
      .setDescription(`${result === 'heads' ? '👑 **Heads!**' : '🔵 **Tails!**'}\n\n${choice ? (won ? '✅ راهنت صح!' : '❌ راهنت غلط!') : ''}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
