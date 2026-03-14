const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('nuke').setDescription('💣 حذف وإعادة إنشاء القناة (مسح كل الرسائل)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const ch = interaction.channel;
    try {
      const newCh = await ch.clone({ reason: `Nuke by ${interaction.user.tag}` });
      await newCh.setPosition(ch.position);
      await ch.delete();
      await newCh.send({ content: `💣 تم تنظيف القناة بواسطة **${interaction.user.tag}**` });
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
