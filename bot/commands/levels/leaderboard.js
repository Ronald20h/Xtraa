const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbAll } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('لوحة المتصدرين / Leaderboard'),
  async execute(interaction) {
    const top = await dbAll('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT 10', [interaction.guildId]);
    if (!top.length) return interaction.reply({ content: '❌ لا توجد بيانات بعد.', ephemeral: true });
    const medals = ['🥇','🥈','🥉'];
    const embed = new EmbedBuilder().setColor('#ffd700').setTitle('🏆 لوحة المتصدرين')
      .setDescription(top.map((u,i) => `${medals[i]||`\`${i+1}.\``} <@${u.user_id}> • Lv.**${u.level}** • ${u.xp} XP`).join('\n'))
      .setThumbnail(interaction.guild.iconURL());
    await interaction.reply({ embeds: [embed] });
  }
};
