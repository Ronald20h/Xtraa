const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('percentage').setDescription('📊 حساب النسبة المئوية')
    .addNumberOption(o => o.setName('part').setDescription('الجزء').setRequired(true))
    .addNumberOption(o => o.setName('total').setDescription('الكل').setRequired(true)),
  async execute(interaction) {
    const part = interaction.options.getNumber('part');
    const total = interaction.options.getNumber('total');
    if (total === 0) return interaction.reply({ content: '❌ لا يمكن القسمة على صفر!', ephemeral: true });
    const pct = ((part / total) * 100).toFixed(2);
    const bar = '█'.repeat(Math.floor(pct/10)) + '░'.repeat(10-Math.floor(pct/10));
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff88').setTitle('📊 النسبة المئوية')
      .addFields(
        { name: '🔢 الجزء', value: `\`${part}\``, inline: true },
        { name: '🔢 الكل', value: `\`${total}\``, inline: true },
        { name: '📊 النسبة', value: `\`${pct}%\``, inline: true },
        { name: '📈 الشريط', value: `\`${bar}\` ${pct}%` }
      )] });
  }
};
