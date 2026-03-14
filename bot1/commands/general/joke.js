const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const JOKES = [
  { q: 'ليش البرمجة زي الزواج؟', a: 'في البداية كلها وعود وأحلام، بعدين تقضي وقتك تصلح الأخطاء 😂' },
  { q: 'ليش المبرمج لا يحب الطبيعة؟', a: 'لأن فيها الكثير من الـ bugs! 🐛' },
  { q: 'كم مبرمج يلزم لتغيير لمبة؟', a: 'لا أحد — ده مشكلة هاردوير! 💡' },
  { q: 'ليش البحر مالح؟', a: 'لأن الأسماك ما بتعرف تطبخ! 🐟' },
  { q: 'ما الفرق بين المبرمج والبيتزا؟', a: 'البيتزا تُسلَّم في الوقت المحدد 🍕' },
  { q: 'ليش الكمبيوتر بارد؟', a: 'لأن عنده كتير من الـ Windows! 🪟' },
  { q: 'رجل دخل مكتبة وقال: أعطني برجر وبطاطس!', a: 'قال له الموظف: هذه مكتبة! قالها همسًا: أعطني برجر وبطاطس 😂' },
];
module.exports = {
  data: new SlashCommandBuilder().setName('joke').setDescription('😂 نكتة عشوائية'),
  async execute(interaction) {
    const j = JOKES[Math.floor(Math.random() * JOKES.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffd700').setTitle('😂 نكتة اليوم')
      .addFields({ name: '❓ السؤال', value: j.q }, { name: '💡 الإجابة', value: j.a })
      .setFooter({ text: 'Xtra Bot • نكتة' })] });
  }
};
