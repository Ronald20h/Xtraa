const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('معلومات السيرفر / Server info'),
  async execute(interaction) {
    const g = interaction.guild;
    await g.members.fetch();
    const bots = g.members.cache.filter(m => m.user.bot).size;
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`📊 ${g.name}`)
      .setThumbnail(g.iconURL({dynamic:true}))
      .addFields(
        {name:'👑 الأونر',value:`<@${g.ownerId}>`,inline:true},
        {name:'👥 الأعضاء',value:`${g.memberCount}`,inline:true},
        {name:'🤖 البوتات',value:`${bots}`,inline:true},
        {name:'📢 القنوات',value:`${g.channels.cache.size}`,inline:true},
        {name:'🎭 الأدوار',value:`${g.roles.cache.size}`,inline:true},
        {name:'😀 الإيموجي',value:`${g.emojis.cache.size}`,inline:true},
        {name:'🌍 المنطقة',value:g.preferredLocale,inline:true},
        {name:'📅 تاريخ الإنشاء',value:`<t:${Math.floor(g.createdTimestamp/1000)}:R>`,inline:true},
      )
      .setFooter({text:`ID: ${g.id}`}).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
