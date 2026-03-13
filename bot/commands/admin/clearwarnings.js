const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('clearwarnings').setDescription('مسح تحذيرات / Clear warnings')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    await dbRun('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?', [interaction.guildId, user.id]);
    await interaction.reply({ content: `✅ تم مسح تحذيرات ${user.tag}` });
  }
};
