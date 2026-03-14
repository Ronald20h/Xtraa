const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('roleinfo').setDescription('معلومات دور / Role info')
    .addRoleOption(o => o.setName('role').setDescription('الدور').setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const embed = new EmbedBuilder().setColor(role.color || '#5865F2').setTitle(`🎭 ${role.name}`)
      .addFields(
        {name:'🆔 ID',value:role.id,inline:true},{name:'🎨 اللون',value:role.hexColor,inline:true},
        {name:'👥 الأعضاء',value:`${role.members.size}`,inline:true},
        {name:'📅 الإنشاء',value:`<t:${Math.floor(role.createdTimestamp/1000)}:R>`,inline:true},
        {name:'🔒 يُذكر',value:role.mentionable?'نعم':'لا',inline:true},{name:'📌 مثبت',value:role.hoist?'نعم':'لا',inline:true},
      );
    await interaction.reply({ embeds: [embed] });
  }
};
