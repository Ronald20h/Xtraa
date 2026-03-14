const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const FACTS = [
  'الأخطبوط لديه 3 قلوب وجهازان دوريان!',
  'النمل يمكنه حمل 50 ضعف وزنه.',
  'البومة لا تستطيع تحريك عينيها — لذلك تحرك رأسها بزاوية 270 درجة!',
  'الزرافة لها نفس عدد فقرات العنق كالإنسان — 7 فقرات فقط.',
  'الفيل هو الحيوان الوحيد الذي لا يستطيع القفز.',
  'الطائر الطنان هو الطائر الوحيد الذي يطير للخلف.',
  'نجم البحر لا يملك دماغاً أو دماء.',
  'سرعة الضوء تكفي للدوران حول الأرض 7 مرات في الثانية.',
  'المحيطات تغطي 71% من سطح الأرض.',
  'الإنسان يستخدم 43 عضلة للعبوس و17 فقط للابتسام.',
  'القلب ينبض أكثر من 100,000 مرة في اليوم.',
  'الدم الأزرق موجود فعلاً — في الأخطبوط والجمبري!',
];
module.exports = {
  data: new SlashCommandBuilder().setName('fact').setDescription('🧠 معلومة مثيرة عشوائية'),
  async execute(interaction) {
    const f = FACTS[Math.floor(Math.random() * FACTS.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00d4ff').setTitle('🧠 هل تعلم؟')
      .setDescription(`> ${f}`)
      .setFooter({ text: 'Xtra Bot • معلومات' })] });
  }
};
