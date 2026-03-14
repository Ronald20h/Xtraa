const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('deleterole').setDescription('🗑️ حذف رتبة')
    .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const name = role.name;
    try {
      await role.delete();
      await interaction.reply(`✅ تم حذف الرتبة **${name}**`);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
