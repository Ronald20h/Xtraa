const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('banner').setDescription('🖼️ بانر عضو أو السيرفر')
    .addUserOption(o => o.setName('user').setDescription('العضو (اتركه لبانر السيرفر)')),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    if (user) {
      const fetched = await user.fetch();
      const banner = fetched.bannerURL({ dynamic: true, size: 1024 });
      if (!banner) return interaction.reply({ content: '❌ هذا المستخدم ليس لديه بانر', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle(`🖼️ بانر ${user.username}`).setImage(banner)] });
    } else {
      const banner = interaction.guild.bannerURL({ dynamic: true, size: 1024 });
      if (!banner) return interaction.reply({ content: '❌ السيرفر ليس له بانر', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle(`🖼️ بانر ${interaction.guild.name}`).setImage(banner)] });
    }
  }
};
