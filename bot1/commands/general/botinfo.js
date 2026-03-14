const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('معلومات البوت / Bot info'),
  async execute(interaction) {
    const uptime = process.uptime();
    const d = Math.floor(uptime/86400), h = Math.floor((uptime%86400)/3600), m = Math.floor((uptime%3600)/60);
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🤖 Xtra Bot')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {name:'📛 الاسم',value:interaction.client.user.tag,inline:true},
        {name:'🆔 ID',value:interaction.client.user.id,inline:true},
        {name:'👨‍💻 المطور',value:'STEVEN',inline:true},
        {name:'🌐 السيرفرات',value:`${interaction.client.guilds.cache.size}`,inline:true},
        {name:'👥 المستخدمون',value:`${interaction.client.users.cache.size}`,inline:true},
        {name:'⚡ الأوامر',value:`${interaction.client.commands.size}`,inline:true},
        {name:'💓 Ping',value:`${interaction.client.ws.ping}ms`,inline:true},
        {name:'⏱️ Uptime',value:`${d}d ${h}h ${m}m`,inline:true},
        {name:'📦 discord.js',value:'v14',inline:true},
      )
      .addFields({name:'📱 الدعم',value:'[واتساب](https://wa.me/201069181060) | [ديسكورد](https://discord.gg/7UtgNs6xfK) | [أضف البوت](https://discord.com/oauth2/authorize?client_id=1481917947407765616)'})
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
