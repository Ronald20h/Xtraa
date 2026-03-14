const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('rps').setDescription('حجرة ورقة مقص / Rock Paper Scissors')
    .addStringOption(o => o.setName('choice').setDescription('اختيارك').setRequired(true)
      .addChoices({name:'🪨 حجرة',value:'rock'},{name:'📄 ورقة',value:'paper'},{name:'✂️ مقص',value:'scissors'})),
  async execute(interaction) {
    const choices = ['rock','paper','scissors'], emojis = {rock:'🪨',paper:'📄',scissors:'✂️'}, names = {rock:'حجرة',paper:'ورقة',scissors:'مقص'};
    const player = interaction.options.getString('choice');
    const bot = choices[Math.floor(Math.random()*3)];
    let result;
    if (player===bot) result='🤝 تعادل!';
    else if ((player==='rock'&&bot==='scissors')||(player==='paper'&&bot==='rock')||(player==='scissors'&&bot==='paper')) result='🎉 فزت!';
    else result='😢 خسرت!';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('✂️ حجرة ورقة مقص')
      .addFields({name:'أنت',value:`${emojis[player]} ${names[player]}`,inline:true},{name:'البوت',value:`${emojis[bot]} ${names[bot]}`,inline:true})
      .setDescription(result)] });
  }
};
