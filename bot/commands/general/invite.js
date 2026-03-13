const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription('رابط دعوة البوت / Invite link'),
  async execute(interaction) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🔗 أضف Xtra Bot')
      .setDescription('[اضغط هنا لإضافة البوت](https://discord.com/oauth2/authorize?client_id=1481917947407765616&permissions=8&scope=bot%20applications.commands)\n\n[سيرفر الدعم](https://discord.gg/7UtgNs6xfK) | [واتساب](https://wa.me/201069181060)')] });
  }
};
