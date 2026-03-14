const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbGet, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('rank').setDescription('عرض مستواك / Show rank')
    .addUserOption(o => o.setName('user').setDescription('المستخدم').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    await ensureGuild(interaction.guildId);
    const data = await dbGet('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?', [interaction.guildId, user.id]);
    if (!data) return interaction.reply({ content: '❌ لا توجد بيانات لهذا المستخدم بعد.', ephemeral: true });
    const rankRow = await dbGet('SELECT COUNT(*)+1 as r FROM levels WHERE guild_id = ? AND xp > ?', [interaction.guildId, data.xp]);
    const progress = data.xp % 100;
    const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`📊 رتبة ${user.username}`).setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🏆 الترتيب', value: `#${rankRow.r}`, inline: true },
        { name: '📈 المستوى', value: `${data.level}`, inline: true },
        { name: '💬 الرسائل', value: `${data.messages}`, inline: true },
        { name: '📊 التقدم', value: `\`${bar}\` ${progress}/100 XP` }
      );
    await interaction.reply({ embeds: [embed] });
  }
};
