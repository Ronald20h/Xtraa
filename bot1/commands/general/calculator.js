const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('calculator').setDescription('🧮 حاسبة رياضية')
    .addStringOption(o => o.setName('expression').setDescription('المعادلة مثال: 5*10+3').setRequired(true)),
  async execute(interaction) {
    const expr = interaction.options.getString('expression').replace(/[^0-9+\-*/().%\s]/g, '');
    try {
      const result = Function('"use strict"; return (' + expr + ')')();
      const embed = new EmbedBuilder().setColor('#5865f2').setTitle('🧮 الحاسبة')
        .addFields({ name: '📥 المعادلة', value: `\`${expr}\``, inline: true }, { name: '📤 الناتج', value: `\`${result}\``, inline: true })
        .setFooter({ text: 'Xtra Bot • الحاسبة' });
      await interaction.reply({ embeds: [embed] });
    } catch { await interaction.reply({ content: '❌ معادلة غير صحيحة!', ephemeral: true }); }
  }
};
