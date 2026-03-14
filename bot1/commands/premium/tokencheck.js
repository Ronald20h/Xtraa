const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbGet } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('tokencheck').setDescription('🔐 [Premium] فحص توكن / Check token')
    .addStringOption(o => o.setName('token').setDescription('التوكن').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const premium = await dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [interaction.guildId]);
    if (!premium) return interaction.editReply({ content: '❌ هذا الأمر للسيرفرات المميزة فقط! استخدم `/premiuminfo` للمزيد.' });
    const token = interaction.options.getString('token');
    const parts = token.split('.');
    const isValid = parts.length === 3 && parts[0].length > 10;
    const embed = new EmbedBuilder().setColor(isValid?'#00ff88':'#ff4444').setTitle('🔐 فحص التوكن')
      .setDescription(isValid ? '✅ صيغة التوكن صحيحة' : '❌ صيغة التوكن خاطئة أو غير مكتملة')
      .addFields({ name: '🔑 التوكن', value: `||${token.substring(0,20)}...||` })
      .setFooter({ text: '⚠️ لا تشارك توكنك مع أي أحد!' });
    await interaction.editReply({ embeds: [embed] });
  }
};
