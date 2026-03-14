const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('سرعة البوت / Bot latency'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 ...', fetchReply: true });
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({ content: '', embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🏓 Pong!')
      .addFields({name:'💓 Latency',value:`${ping}ms`,inline:true},{name:'🔗 API',value:`${interaction.client.ws.ping}ms`,inline:true})] });
  }
};
