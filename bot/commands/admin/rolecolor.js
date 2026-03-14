const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('rolecolor').setDescription('🎨 تغيير لون رتبة')
    .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    .addStringOption(o => o.setName('color').setDescription('اللون HEX مثال: #ff0000').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const color = interaction.options.getString('color');
    try {
      await role.setColor(color);
      await interaction.reply(`✅ تم تغيير لون **${role.name}** إلى \`${color}\``);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
