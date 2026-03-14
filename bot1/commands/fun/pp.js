const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('pp').setDescription('📏 قياس القوة العشوائية لشخص 💪')
    .addUserOption(o => o.setName('user').setDescription('العضو')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const power = Math.floor(Math.random() * 101);
    const bar = '█'.repeat(Math.floor(power/10)) + '░'.repeat(10-Math.floor(power/10));
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2')
      .setTitle('💪 قياس القوة (للمرح فقط!)')
      .setDescription(`**${user.username}**\n\n\`${bar}\`\n\n# ${power}%`)
      .setFooter({ text: '⚠️ للمرح فقط!' })] });
  }
};
