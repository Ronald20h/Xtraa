const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('rps').setDescription('✊ حجرة ورقة مقص')
    .addStringOption(o => o.setName('choice').setDescription('اختيارك').setRequired(true)
      .addChoices({name:'✊ حجرة',value:'rock'},{name:'✋ ورقة',value:'paper'},{name:'✌️ مقص',value:'scissors'})),
  async execute(interaction) {
    const choices = ['rock','paper','scissors'];
    const emojis = {rock:'✊',paper:'✋',scissors:'✌️'};
    const names = {rock:'حجرة',paper:'ورقة',scissors:'مقص'};
    const player = interaction.options.getString('choice');
    const bot = choices[Math.floor(Math.random() * 3)];
    let result = 'تعادل!'; let color = '#ffd700';
    if ((player==='rock'&&bot==='scissors')||(player==='paper'&&bot==='rock')||(player==='scissors'&&bot==='paper')) { result='🏆 فزت!'; color='#00ff88'; }
    else if (player !== bot) { result='💀 خسرت!'; color='#ff4444'; }
    const embed = new EmbedBuilder().setColor(color).setTitle('✊ حجرة ورقة مقص')
      .setDescription(`**أنت:** ${emojis[player]} ${names[player]}\n**البوت:** ${emojis[bot]} ${names[bot]}\n\n**النتيجة:** ${result}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
