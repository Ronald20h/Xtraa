const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('age').setDescription('🎂 احسب عمرك')
    .addStringOption(o => o.setName('birthdate').setDescription('تاريخ الميلاد YYYY-MM-DD').setRequired(true)),
  async execute(interaction) {
    const bd = new Date(interaction.options.getString('birthdate'));
    if (isNaN(bd)) return interaction.reply({ content: '❌ تاريخ غير صحيح! مثال: `2000-01-15`', ephemeral: true });
    const now = new Date();
    let years = now.getFullYear() - bd.getFullYear();
    let months = now.getMonth() - bd.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < bd.getDate())) { years--; months += 12; }
    const days = Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    const nextBd = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
    if (nextBd < now) nextBd.setFullYear(now.getFullYear() + 1);
    const daysLeft = Math.ceil((nextBd - now) / 86400000);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff9ff3').setTitle('🎂 حاسبة العمر')
      .addFields(
        { name: '🎉 العمر', value: `\`${years}\` سنة و \`${months}\` شهر`, inline: true },
        { name: '📅 أيام للعيد', value: `\`${daysLeft}\` يوم`, inline: true },
        { name: '📊 بالأيام الكلي', value: `\`${Math.floor((now - bd) / 86400000)}\` يوم` }
      )] });
  }
};
