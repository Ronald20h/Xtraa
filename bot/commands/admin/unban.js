const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('unban').setDescription('رفع الحظر / Unban')
    .addStringOption(o => o.setName('userid').setDescription('ID المستخدم').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب';
    try {
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({ content: `✅ تم رفع الحظر عن <@${userId}>` });
    } catch { await interaction.reply({ content: '❌ لم أجد هذا المستخدم في المحظورين', ephemeral: true }); }
  }
};
