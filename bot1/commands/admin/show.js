const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('show').setDescription('👁️ إظهار القناة للأعضاء')
    .addChannelOption(o => o.setName('channel').setDescription('القناة (افتراضي: الحالية)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const ch = interaction.options.getChannel('channel') || interaction.channel;
    await ch.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: null });
    await interaction.reply(`✅ تم إظهار **${ch.name}** للأعضاء`);
  }
};
