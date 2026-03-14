const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('hide').setDescription('👁️ إخفاء القناة عن الأعضاء')
    .addChannelOption(o => o.setName('channel').setDescription('القناة (افتراضي: الحالية)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const ch = interaction.options.getChannel('channel') || interaction.channel;
    await ch.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
    await interaction.reply(`✅ تم إخفاء **${ch.name}** عن الأعضاء`);
  }
};
