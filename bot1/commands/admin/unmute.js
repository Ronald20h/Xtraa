const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('unmute').setDescription('إلغاء كتم / Unmute member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ العضو غير موجود', ephemeral: true });
    try {
      await member.timeout(null);
      await interaction.reply({ content: `✅ تم إلغاء كتم ${user.tag}` });
    } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
