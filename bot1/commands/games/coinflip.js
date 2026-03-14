const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('coinflip').setDescription('رمي عملة / Flip a coin')
    .addStringOption(o => o.setName('choice').setDescription('اختيارك').addChoices({name:'👑 صورة',value:'heads'},{name:'🌀 كتابة',value:'tails'})),
  async execute(interaction) {
    const choice = interaction.options.getString('choice');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = !choice || choice === result;
    const embed = new EmbedBuilder().setColor(won?'#00ff88':'#ff4444')
      .setTitle(result === 'heads' ? '👑 صورة!' : '🌀 كتابة!')
      .setDescription(choice ? (won ? '🎉 فزت!' : '😢 خسرت!') : `النتيجة: **${result === 'heads' ? 'صورة' : 'كتابة'}**`);
    await interaction.reply({ embeds: [embed] });
  }
};
