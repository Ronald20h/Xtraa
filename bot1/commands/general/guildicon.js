const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('guildicon').setDescription('🖼️ أيقونة السيرفر'),
  async execute(interaction) {
    const icon = interaction.guild.iconURL({ dynamic: true, size: 1024 });
    if (!icon) return interaction.reply({ content: '❌ السيرفر ليس له أيقونة', ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setTitle(`🖼️ ${interaction.guild.name}`).setImage(icon)] });
  }
};
