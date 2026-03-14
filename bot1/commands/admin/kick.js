const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { dbRun } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('kick').setDescription('طرد عضو / Kick member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ العضو غير موجود', ephemeral: true });
    try {
      await member.kick(reason);
      dbRun('INSERT INTO logs (guild_id, type, user_id, target_id, details) VALUES (?, ?, ?, ?, ?)',
        [interaction.guildId, 'kick', interaction.user.id, user.id, reason]);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff8800').setTitle('👢 تم الطرد')
        .addFields({name:'👤',value:user.tag,inline:true},{name:'📝',value:reason,inline:true})] });
    } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
