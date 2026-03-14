const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuild, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('setlog').setDescription('تعيين قناة اللوقات / Set log channel')
    .addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await ensureGuild(interaction.guildId);
    await updateGuild(interaction.guildId, { log_channel: interaction.options.getChannel('channel').id });
    await interaction.reply({ content: `✅ تم تعيين قناة اللوقات: <#${interaction.options.getChannel('channel').id}>` });
  }
};
