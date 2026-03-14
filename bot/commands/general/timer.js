const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('timer').setDescription('⏱️ مؤقت / عداد تنازلي')
    .addIntegerOption(o => o.setName('seconds').setDescription('المدة بالثواني (10-300)').setRequired(true).setMinValue(10).setMaxValue(300))
    .addStringOption(o => o.setName('label').setDescription('اسم المؤقت')),
  async execute(interaction) {
    const secs = interaction.options.getInteger('seconds');
    const label = interaction.options.getString('label') || 'مؤقت';
    const endsAt = Math.floor((Date.now() + secs * 1000) / 1000);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#e67e22').setTitle(`⏱️ ${label}`)
      .setDescription(`ينتهي <t:${endsAt}:R> — <t:${endsAt}:T>`)
      .setFooter({ text: `${secs} ثانية` })] });
    setTimeout(async () => {
      await interaction.followUp({ content: `⏰ **${label}** انتهى! <@${interaction.user.id}>` });
    }, secs * 1000);
  }
};
