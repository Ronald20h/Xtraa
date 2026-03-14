const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('hug').setDescription('🤗 احضن شخص')
    .addUserOption(o => o.setName('user').setDescription('الشخص').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const msgs = [`${interaction.user} احتضن ${user} بدفء! 🤗`, `${user} تلقى حضن من ${interaction.user}! 💕`, `${interaction.user} أرسل حضن حار لـ ${user}! 🫂`];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff9ff3')
      .setTitle('🤗 حضن!')
      .setDescription(msgs[Math.floor(Math.random()*msgs.length)])
      .setFooter({ text: 'Xtra Bot • اجتماعي' })] });
  }
};
