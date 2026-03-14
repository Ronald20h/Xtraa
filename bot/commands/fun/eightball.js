const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ANSWERS = [
  { text: 'نعم بالتأكيد! ✅', color: '#00ff88' },
  { text: 'من المرجح جداً! ✅', color: '#00ff88' },
  { text: 'بدون شك! ✅', color: '#00ff88' },
  { text: 'يبدو جيداً ✅', color: '#00ff88' },
  { text: 'نعم 👍', color: '#00ff88' },
  { text: 'لا أعرف، اسأل لاحقاً 🤷', color: '#ffd700' },
  { text: 'الجواب ضبابي جداً 😶‍🌫️', color: '#ffd700' },
  { text: 'لا أستطيع التنبؤ الآن ⏳', color: '#ffd700' },
  { text: 'ركز وجرب مجدداً 🔄', color: '#ffd700' },
  { text: 'لا 👎', color: '#ff4444' },
  { text: 'لا أعتقد ذلك ❌', color: '#ff4444' },
  { text: 'آفاقي لا تبشر بخير ❌', color: '#ff4444' },
  { text: 'مشكوك فيه جداً 🤨', color: '#ff4444' },
];
module.exports = {
  data: new SlashCommandBuilder().setName('8ball').setDescription('🎱 اسأل الكرة السحرية')
    .addStringOption(o => o.setName('question').setDescription('سؤالك').setRequired(true)),
  async execute(interaction) {
    const q = interaction.options.getString('question');
    const ans = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(ans.color)
      .setTitle('🎱 الكرة السحرية')
      .addFields({ name: '❓ السؤال', value: q }, { name: '🎱 الجواب', value: ans.text })
      .setFooter({ text: 'Xtra Bot • 8ball' })] });
  }
};
