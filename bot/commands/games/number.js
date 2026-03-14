const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('number').setDescription('تخمين الأرقام / Guess the number')
    .addIntegerOption(o => o.setName('guess').setDescription('تخمينك (1-100)').setMinValue(1).setMaxValue(100).setRequired(true)),
  async execute(interaction) {
    const target = Math.floor(Math.random()*100)+1;
    const guess = interaction.options.getInteger('guess');
    const diff = Math.abs(target-guess);
    let result, color;
    if (diff===0){result='🎉 مبروك! أصبت الرقم بالضبط!';color='#00ff88';}
    else if(diff<=5){result=`🔥 قريب جداً! الرقم كان ${target}`;color='#ffd700';}
    else if(diff<=15){result=`😊 قريب! الرقم كان ${target}`;color='#ffa500';}
    else{result=`❌ بعيد! الرقم كان ${target}`;color='#ff4444';}
    await interaction.reply({ embeds:[new EmbedBuilder().setColor(color).setTitle('🔢 لعبة الأرقام')
      .addFields({name:'🎯 تخمينك',value:`${guess}`,inline:true},{name:'🔑 الرقم',value:`${target}`,inline:true})
      .setDescription(result)] });
  }
};
