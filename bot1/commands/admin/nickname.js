const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('nickname').setDescription('تغيير اسم / Change nickname')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('الاسم الجديد (فارغ للإزالة)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const nick = interaction.options.getString('nickname') || null;
    const member = interaction.guild.members.cache.get(user.id);
    await member.setNickname(nick);
    await interaction.reply({ content: `✅ ${nick ? `تم تغيير اسم ${user.tag} إلى **${nick}**` : `تم إزالة اسم ${user.tag}`}` });
  }
};
