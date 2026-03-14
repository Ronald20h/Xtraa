const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('rolename').setDescription('✏️ تغيير اسم رتبة')
    .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    .addStringOption(o => o.setName('name').setDescription('الاسم الجديد').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const name = interaction.options.getString('name');
    const old = role.name;
    try {
      await role.setName(name);
      await interaction.reply(`✅ تم تغيير اسم الرتبة من **${old}** إلى **${name}**`);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
