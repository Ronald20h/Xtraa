const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { dbRun } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('ban').setDescription('حظر عضو / Ban member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false))
    .addIntegerOption(o => o.setName('days').setDescription('حذف رسائل (أيام 0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب';
    const days = interaction.options.getInteger('days') || 0;
    try {
      await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: days * 86400 });
      dbRun('INSERT INTO logs (guild_id, type, user_id, target_id, details) VALUES (?, ?, ?, ?, ?)',
        [interaction.guildId, 'ban', interaction.user.id, user.id, reason]);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff4444').setTitle('🔨 تم الحظر')
        .addFields({name:'👤 المستخدم',value:user.tag,inline:true},{name:'📝 السبب',value:reason,inline:true}).setTimestamp()] });
    } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
