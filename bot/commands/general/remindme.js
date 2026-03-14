const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('remindme').setDescription('تذكير مؤقت / Reminder')
    .addIntegerOption(o => o.setName('minutes').setDescription('بعد كم دقيقة').setMinValue(1).setMaxValue(10080).setRequired(true))
    .addStringOption(o => o.setName('reminder').setDescription('التذكير').setRequired(true)),
  async execute(interaction) {
    const mins = interaction.options.getInteger('minutes');
    const reminder = interaction.options.getString('reminder');
    await interaction.reply({ content: `✅ سأذكرك بـ **${reminder}** بعد **${mins}** دقيقة!`, ephemeral: true });
    setTimeout(async () => {
      try { await interaction.user.send({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('⏰ تذكير!').setDescription(reminder).setTimestamp()] }); }
      catch { await interaction.followUp({ content: `⏰ ${interaction.user} تذكير: **${reminder}**` }).catch(() => {}); }
    }, mins * 60 * 1000);
  }
};
