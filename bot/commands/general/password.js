const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('password').setDescription('🔐 توليد كلمة مرور قوية')
    .addIntegerOption(o => o.setName('length').setDescription('الطول (8-64)').setMinValue(8).setMaxValue(64)),
  async execute(interaction) {
    const len = interaction.options.getInteger('length') || 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const pass = Array.from({length: len}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    const embed = new EmbedBuilder().setColor('#00ff88').setTitle('🔐 كلمة مرور جديدة')
      .setDescription(`\`\`\`${pass}\`\`\``)
      .addFields({ name: '📏 الطول', value: `\`${len}\` حرف`, inline: true }, { name: '💪 القوة', value: len >= 16 ? '✅ قوية' : '⚠️ متوسطة', inline: true })
      .setFooter({ text: 'لا تشارك كلمة المرور مع أحد!' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
