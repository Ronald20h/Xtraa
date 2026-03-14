const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('channelinfo').setDescription('📢 معلومات عن قناة')
    .addChannelOption(o => o.setName('channel').setDescription('القناة (افتراضي: الحالية)')),
  async execute(interaction) {
    const ch = interaction.options.getChannel('channel') || interaction.channel;
    const typeNames = { 0:'نصية 💬', 2:'صوتية 🔊', 4:'فئة 📁', 5:'إعلانات 📢', 15:'منتدى 📋' };
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle(`📢 ${ch.name}`)
      .addFields(
        { name: '🆔 ID', value: `\`${ch.id}\``, inline: true },
        { name: '📋 النوع', value: typeNames[ch.type] || 'أخرى', inline: true },
        { name: '📅 أنشئت', value: `<t:${Math.floor(ch.createdTimestamp/1000)}:R>`, inline: true },
        { name: '🐢 Slowmode', value: ch.rateLimitPerUser ? `\`${ch.rateLimitPerUser}s\`` : '❌', inline: true },
        { name: '📌 NSFW', value: ch.nsfw ? '✅' : '❌', inline: true },
        { name: '💬 الوصف', value: ch.topic || 'لا يوجد' }
      )] });
  }
};
