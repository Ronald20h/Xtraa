const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
module.exports = {
  data: new SlashCommandBuilder().setName('translate').setDescription('ترجمة نص / Translate text')
    .addStringOption(o => o.setName('text').setDescription('النص').setRequired(true))
    .addStringOption(o => o.setName('to').setDescription('اللغة المستهدفة (مثال: en, ar, fr)').setRequired(false)),
  async execute(interaction) {
    await interaction.deferReply();
    const text = interaction.options.getString('text');
    const to = interaction.options.getString('to') || 'ar';
    try {
      const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
      const translated = res.data[0].map(x => x[0]).join('');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🌐 ترجمة')
        .addFields({name:'📝 الأصل',value:text},{name:'✅ الترجمة',value:translated})] });
    } catch { await interaction.editReply({ content: '❌ حدث خطأ في الترجمة' }); }
  }
};
