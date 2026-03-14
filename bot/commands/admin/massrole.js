const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('massrole').setDescription('👥 إضافة/إزالة رتبة من جميع الأعضاء')
    .addStringOption(o => o.setName('action').setDescription('الإجراء').setRequired(true).addChoices({name:'إضافة',value:'add'},{name:'إزالة',value:'remove'}))
    .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');
    await interaction.reply({ content: `⏳ جارٍ ${action === 'add' ? 'إضافة' : 'إزالة'} الرتبة من الأعضاء...` });
    const members = await interaction.guild.members.fetch();
    let count = 0;
    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        if (action === 'add') await member.roles.add(role);
        else await member.roles.remove(role);
        count++;
      } catch {}
    }
    await interaction.editReply({ content: `✅ تم ${action === 'add' ? 'إضافة' : 'إزالة'} ${role} ${action === 'add' ? 'لـ' : 'من'} **${count}** عضو!` });
  }
};
