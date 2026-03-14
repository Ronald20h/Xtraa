const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('math').setDescription('📐 عمليات رياضية متقدمة')
    .addStringOption(o => o.setName('type').setDescription('نوع العملية').setRequired(true)
      .addChoices(
        {name:'تربيع √', value:'sqrt'}, {name:'أس x^n', value:'pow'},
        {name:'باقي القسمة', value:'mod'}, {name:'مطلق القيمة', value:'abs'},
        {name:'تقريب', value:'round'}, {name:'عشوائي', value:'random'}
      ))
    .addNumberOption(o => o.setName('number').setDescription('الرقم الأول').setRequired(true))
    .addNumberOption(o => o.setName('number2').setDescription('الرقم الثاني (للأس والباقي)')),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const n = interaction.options.getNumber('number');
    const n2 = interaction.options.getNumber('number2');
    let result, desc;
    switch(type) {
      case 'sqrt': result = Math.sqrt(n); desc = `√${n} = ${result}`; break;
      case 'pow': result = Math.pow(n, n2||2); desc = `${n}^${n2||2} = ${result}`; break;
      case 'mod': result = n % (n2||2); desc = `${n} % ${n2||2} = ${result}`; break;
      case 'abs': result = Math.abs(n); desc = `|${n}| = ${result}`; break;
      case 'round': result = Math.round(n); desc = `تقريب ${n} = ${result}`; break;
      case 'random': result = Math.floor(Math.random()*n)+1; desc = `عشوائي بين 1 و ${n} = ${result}`; break;
    }
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle('📐 الحساب').setDescription(`\`\`\`${desc}\`\`\``)] });
  }
};
