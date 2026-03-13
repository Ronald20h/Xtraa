const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('slowmode').setDescription('تعيين وضع البطء / Set slowmode')
    .addIntegerOption(o => o.setName('seconds').setDescription('الثواني (0 = إيقاف)').setMinValue(0).setMaxValue(21600).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply({ content: seconds === 0 ? '✅ تم إيقاف وضع البطء' : `✅ وضع البطء: ${seconds} ثانية` });
  }
};
