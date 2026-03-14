const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { dbRun } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('mute').setDescription('كتم عضو / Mute member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('المدة بالدقائق').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('reason').setDescription('السبب'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ العضو غير موجود', ephemeral: true });
    try {
      await member.timeout(duration * 60 * 1000, reason);
      dbRun('INSERT INTO logs (guild_id, type, user_id, target_id, details) VALUES (?, ?, ?, ?, ?)',
        [interaction.guildId, 'mute', interaction.user.id, user.id, `${duration}m - ${reason}`]);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffa500').setTitle('🔇 تم الكتم')
        .addFields({name:'👤',value:user.tag,inline:true},{name:'⏱️ المدة',value:`${duration} دقيقة`,inline:true},{name:'📝',value:reason,inline:true})] });
    } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
