const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QUOTES = [
  { text: 'النجاح ليس نهاية الطريق، والفشل ليس نهاية الأمل، بل الشجاعة هي ما يستمر في المضي قدماً.', author: 'ونستون تشرشل' },
  { text: 'الفرصة لا تأتي، بل تصنعها أنت.', author: 'كريس غروس' },
  { text: 'لا تقس نجاحك بما حققته، بل قسه بما تجاوزته من عقبات.', author: 'بوكر تي واشنطن' },
  { text: 'الحياة ليست في انتظار أن تمر العاصفة، بل في تعلم الرقص تحت المطر.', author: 'فيفيان غرين' },
  { text: 'كل إنجاز عظيم كان في يوم ما مجرد حلم.', author: 'جيمس ألن' },
  { text: 'اعمل بصمت ودع نجاحك يتكلم.', author: 'مجهول' },
  { text: 'من لم يعرف قيمة الوقت، عاش في الضياع.', author: 'مجهول' },
  { text: 'العلم بلا عمل كالشجرة بلا ثمر.', author: 'حكمة عربية' },
  { text: 'أقوى شخص هو من يتحكم في نفسه.', author: 'حكمة إسلامية' },
  { text: 'اطلب العلم من المهد إلى اللحد.', author: 'مأثور' },
];
module.exports = {
  data: new SlashCommandBuilder().setName('quote').setDescription('💬 اقتباس ملهم عشوائي'),
  async execute(interaction) {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#9b59b6')
      .setTitle('💬 اقتباس اليوم')
      .setDescription(`> *"${q.text}"*`)
      .setFooter({ text: `— ${q.author}` })] });
  }
};
