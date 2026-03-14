const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('avatar').setDescription('الصورة الشخصية / Avatar')
    .addUserOption(o => o.setName('user').setDescription('المستخدم')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const formats = ['png','jpg','webp'];
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`🖼️ ${user.username}`)
      .setImage(user.displayAvatarURL({dynamic:true,size:512}))
      .setDescription(formats.map(f=>`[${f.toUpperCase()}](${user.displayAvatarURL({format:f,size:512})})`).join(' • '));
    await interaction.reply({ embeds: [embed] });
  }
};
