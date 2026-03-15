const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, ensureGuild } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('clearwarnings').setDescription('🗑️ مسح تحذيرات عضو')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    ensureGuild(interaction.guildId);
    dbRun('DELETE FROM warnings WHERE guild_id=? AND user_id=?', [interaction.guildId, user.id]);
    return interaction.reply({ content: `✅ تم مسح تحذيرات **${user.tag}**`, ephemeral: true });
  }
};
