const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
module.exports = {
  data: new SlashCommandBuilder().setName('weather').setDescription('معلومات الطقس / Weather')
    .addStringOption(o => o.setName('city').setDescription('المدينة / City').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const city = interaction.options.getString('city');
    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const w = res.data.current_condition[0];
      const desc = w.weatherDesc[0].value;
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`🌤️ طقس ${city}`)
        .addFields(
          {name:'🌡️ الحرارة',value:`${w.temp_C}°C / ${w.temp_F}°F`,inline:true},
          {name:'💧 الرطوبة',value:`${w.humidity}%`,inline:true},
          {name:'💨 الرياح',value:`${w.windspeedKmph} km/h`,inline:true},
          {name:'👁️ الرؤية',value:`${w.visibility} km`,inline:true},
          {name:'📋 الوصف',value:desc,inline:true},
        );
      await interaction.editReply({ embeds: [embed] });
    } catch { await interaction.editReply({ content: '❌ لم أجد هذه المدينة.' }); }
  }
};
