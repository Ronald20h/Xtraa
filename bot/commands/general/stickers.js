const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('stickers').setDescription('🎭 قائمة ستيكرات السيرفر'),
  async execute(interaction) {
    const stickers = await interaction.guild.stickers.fetch();
    if (!stickers.size) return interaction.reply({ content: '📭 لا توجد ستيكرات في هذا السيرفر', ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle('🎭 ستيكرات السيرفر')
      .setDescription(stickers.map(s => `**${s.name}** — \`${s.id}\``).join('\n'))
      .setFooter({ text: `${stickers.size} ستيكر` })] });
  }
};
