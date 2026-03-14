const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbGet } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('premiuminfo').setDescription('معلومات البريميوم / Premium info'),
  async execute(interaction) {
    const premium = await dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [interaction.guildId]);
    const embed = new EmbedBuilder().setColor(premium?'#ffd700':'#5865F2').setTitle(premium?'⭐ هذا السيرفر مميز!':'💎 Xtra Premium')
      .setDescription(premium ? `**الخطة:** ${premium.plan}\n**ينتهي:** ${premium.expires_at||'دائم ♾️'}` : 'احصل على ميزات حصرية!\n🔐 فحص التوكنات\n📊 إحصائيات متقدمة\n⭐ أولوية الدعم')
      .addFields({ name: '📱 تواصل معنا', value: '[واتساب](https://wa.me/201069181060) | [ديسكورد](https://discord.gg/7UtgNs6xfK)' });
    await interaction.reply({ embeds: [embed] });
  }
};
