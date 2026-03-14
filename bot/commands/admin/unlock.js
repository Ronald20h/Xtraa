const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('unlock').setDescription('فتح قناة / Unlock channel')
    .addChannelOption(o => o.setName('channel').setDescription('القناة'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const ch = interaction.options.getChannel('channel') || interaction.channel;
    await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.reply({ content: `🔓 تم فتح <#${ch.id}>` });
  }
};
