const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('addrole').setDescription('إضافة دور / Add role')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('الدور').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ العضو غير موجود', ephemeral: true });
    await member.roles.add(role);
    await interaction.reply({ content: `✅ تم إضافة ${role} لـ ${user.tag}` });
  }
};
