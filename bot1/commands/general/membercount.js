const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('membercount').setDescription('👥 إحصائيات أعضاء السيرفر'),
  async execute(interaction) {
    await interaction.guild.members.fetch();
    const total = interaction.guild.memberCount;
    const bots = interaction.guild.members.cache.filter(m => m.user.bot).size;
    const humans = total - bots;
    const online = interaction.guild.members.cache.filter(m => m.presence?.status !== 'offline' && !m.user.bot).size;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle('👥 أعضاء السيرفر')
      .addFields(
        { name: '👥 الكل', value: `\`${total}\``, inline: true },
        { name: '🧑 البشر', value: `\`${humans}\``, inline: true },
        { name: '🤖 البوتات', value: `\`${bots}\``, inline: true },
        { name: '🟢 أونلاين', value: `\`${online}\``, inline: true }
      ).setThumbnail(interaction.guild.iconURL({ dynamic: true }) || '')] });
  }
};
