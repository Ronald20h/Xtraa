const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addLog } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('تغيير اسم عضو / Rename member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('name').setDescription('الاسم الجديد (اتركه فارغاً للإزالة)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const name = interaction.options.getString('name') || null;
    if (!member) return interaction.reply({ content: '❌ عضو غير موجود', ephemeral: true });
    const oldName = member.displayName;
    try {
      await member.setNickname(name, `Changed by ${interaction.user.tag}`);
      addLog(interaction.guildId, 'rename', interaction.user.id, member.id, `${oldName} → ${name || 'إزالة الاسم'}`);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff88').setDescription(`✅ تم تغيير اسم **${member.user.tag}**\n**قبل:** ${oldName}\n**بعد:** ${name || '(لا يوجد)'}`)] });
    } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
