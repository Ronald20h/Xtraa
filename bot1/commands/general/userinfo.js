const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('userinfo').setDescription('معلومات مستخدم / User info')
    .addUserOption(o => o.setName('user').setDescription('المستخدم')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({dynamic:true,size:256}))
      .addFields(
        {name:'🆔 ID',value:user.id,inline:true},
        {name:'🤖 بوت',value:user.bot?'نعم':'لا',inline:true},
        {name:'📅 الحساب',value:`<t:${Math.floor(user.createdTimestamp/1000)}:R>`,inline:true},
        ...(member?[
          {name:'📥 الانضمام',value:`<t:${Math.floor(member.joinedTimestamp/1000)}:R>`,inline:true},
          {name:'🎭 الأدوار',value:`${member.roles.cache.size-1}`,inline:true},
          {name:'🏷️ أعلى دور',value:`${member.roles.highest}`,inline:true},
        ]:[]),
      )
      .setFooter({text:`Xtra Bot`}).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
