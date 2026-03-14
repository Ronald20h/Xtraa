const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('choice').setDescription('🎲 اختيار عشوائي بين خيارات')
    .addStringOption(o => o.setName('options').setDescription('الخيارات مفصولة بـ | مثال: بيتزا | برجر | شاورما').setRequired(true)),
  async execute(interaction) {
    const opts = interaction.options.getString('options').split('|').map(s => s.trim()).filter(Boolean);
    if (opts.length < 2) return interaction.reply({ content: '❌ ضع خيارين على الأقل مفصولين بـ |', ephemeral: true });
    const chosen = opts[Math.floor(Math.random() * opts.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffd700').setTitle('🎲 الاختيار العشوائي')
      .setDescription(`> من بين **${opts.length}** خيارات، اخترت لك:\n\n## ✨ ${chosen}`)
      .addFields({ name: '📋 الخيارات', value: opts.map((o,i) => `${i+1}. ${o}`).join('\n') })
      .setFooter({ text: 'Xtra Bot • الاختيار العشوائي' })] });
  }
};
