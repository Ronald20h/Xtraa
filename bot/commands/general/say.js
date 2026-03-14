const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('say').setDescription('إرسال رسالة / Say message')
    .addStringOption(o => o.setName('message').setDescription('الرسالة').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('القناة'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const msg = interaction.options.getString('message');
    const ch = interaction.options.getChannel('channel') || interaction.channel;
    await ch.send(msg);
    await interaction.reply({ content: '✅ تم الإرسال', ephemeral: true });
  }
};
