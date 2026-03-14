const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('removerole').setDescription('إزالة دور / Remove role')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('الدور').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = interaction.guild.members.cache.get(user.id);
    await member.roles.remove(role);
    await interaction.reply({ content: `✅ تم إزالة ${role} من ${user.tag}` });
  }
};
