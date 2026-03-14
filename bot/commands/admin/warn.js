const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { dbRun, dbGet, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('تحذير عضو / Warn member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    await ensureGuild(interaction.guildId);
    await dbRun('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)', [interaction.guildId, user.id, interaction.user.id, reason]);
    const row = await dbGet('SELECT COUNT(*) as c FROM warnings WHERE guild_id = ? AND user_id = ?', [interaction.guildId, user.id]);
    const embed = new EmbedBuilder().setColor('#ffa500').setTitle('⚠️ تحذير')
      .addFields({ name: '👤', value: user.tag, inline: true }, { name: '📝 السبب', value: reason, inline: true }, { name: '🔢 الإجمالي', value: `${row.c}`, inline: true });
    await interaction.reply({ embeds: [embed] });
  }
};
