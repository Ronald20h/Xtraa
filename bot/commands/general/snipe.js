const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const snipeCache = new Map(); // channel_id -> {content, author, timestamp}
module.exports = {
  data: new SlashCommandBuilder().setName('snipe').setDescription('👀 آخر رسالة محذوفة في القناة'),
  async execute(interaction) {
    const snipe = snipeCache.get(interaction.channelId);
    if (!snipe) return interaction.reply({ content: '📭 لا توجد رسائل محذوفة مؤخراً!', ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff4444').setTitle('👀 رسالة محذوفة')
      .setDescription(snipe.content || '*[محتوى غير نصي]*')
      .setAuthor({ name: snipe.author, iconURL: snipe.avatar })
      .setFooter({ text: `حُذفت ${Math.floor((Date.now()-snipe.timestamp)/1000)} ثانية مضت` })] });
  },
  snipeCache
};
