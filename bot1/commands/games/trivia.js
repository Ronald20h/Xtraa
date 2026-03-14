const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const questions = [
  {q:'ما عاصمة المملكة العربية السعودية؟',a:'الرياض',w:['جدة','مكة','الدمام']},
  {q:'كم عدد كواكب المجموعة الشمسية؟',a:'8',w:['7','9','10']},
  {q:'من هو أول إنسان وطئ سطح القمر؟',a:'نيل أرمسترونج',w:['باز ألدرين','يوري غاغارين','جون غلين']},
  {q:'ما هي أكبر دولة في العالم من حيث المساحة؟',a:'روسيا',w:['كندا','الصين','الولايات المتحدة']},
  {q:'كم عدد أيام السنة الكبيسة؟',a:'366',w:['365','364','367']},
];
module.exports = {
  data: new SlashCommandBuilder().setName('trivia').setDescription('سؤال معلومات عامة / Trivia'),
  async execute(interaction) {
    const q = questions[Math.floor(Math.random()*questions.length)];
    const options = [q.a,...q.w].sort(()=>Math.random()-0.5);
    const row = new ActionRowBuilder().addComponents(
      options.map((o,i) => new ButtonBuilder()
        .setCustomId(o===q.a?`trivia_correct_${i}`:`trivia_wrong_${i}`)
        .setLabel(o).setStyle(o===q.a?ButtonStyle.Success:ButtonStyle.Secondary))
    );
    await interaction.reply({ embeds:[new EmbedBuilder().setColor('#5865F2').setTitle('🎯 سؤال معلومات').setDescription(q.q)], components:[row] });
  }
};
