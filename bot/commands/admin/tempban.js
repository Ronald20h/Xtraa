const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addLog } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('tempban').setDescription('⏳ حظر مؤقت')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addIntegerOption(o => o.setName('hours').setDescription('المدة بالساعات').setRequired(true).setMinValue(1).setMaxValue(720))
    .addStringOption(o => o.setName('reason').setDescription('السبب'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const hours = interaction.options.getInteger('hours');
    const reason = interaction.options.getString('reason') || 'حظر مؤقت';
    try {
      await interaction.guild.members.ban(user.id, { reason });
      addLog(interaction.guildId, 'tempban', interaction.user.id, user.id, `${hours}h — ${reason}`);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff6600')
        .setTitle('⏳ حظر مؤقت')
        .addFields({ name:'👤', value: user.tag, inline:true }, { name:'⏱️ المدة', value: `${hours} ساعة`, inline:true }, { name:'📝', value: reason, inline:true })] });
      setTimeout(async () => {
        await interaction.guild.members.unban(user.id, 'انتهاء الحظر المؤقت').catch(()=>{});
      }, hours * 3600000);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
