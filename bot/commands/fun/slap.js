const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('slap').setDescription('👋 صفّع شخص (للمرح!)')
    .addUserOption(o => o.setName('user').setDescription('الشخص').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const msgs = [`${interaction.user} صفّع ${user} بكل قوته! 😱`, `${interaction.user} أرسل صفعة مجانية لـ ${user}! 👋`, `آخ! ${user} تلقى صفعة من ${interaction.user}! 🤕`];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff6600')
      .setTitle('👋 صفعة!')
      .setDescription(msgs[Math.floor(Math.random()*msgs.length)])
      .setFooter({ text: 'للمرح فقط 😄' })] });
  }
};
