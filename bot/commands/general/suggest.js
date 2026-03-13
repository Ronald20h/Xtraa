const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensureGuild, getGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('suggest').setDescription('إرسال اقتراح / Send suggestion')
    .addStringOption(o => o.setName('suggestion').setDescription('الاقتراح').setRequired(true)),
  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');
    ensureGuild(interaction.guildId);
    const guild = getGuild(interaction.guildId);
    const ch = guild?.log_channel ? interaction.guild.channels.cache.get(guild.log_channel) : null;
    const embed = new EmbedBuilder().setColor('#ffd700').setTitle('💡 اقتراح جديد')
      .setDescription(suggestion).setAuthor({name:interaction.user.tag,iconURL:interaction.user.displayAvatarURL()}).setTimestamp();
    if (ch) {
      const msg = await ch.send({ embeds: [embed] });
      await msg.react('✅').catch(() => {});
      await msg.react('❌').catch(() => {});
    }
    await interaction.reply({ content: '✅ تم إرسال اقتراحك!', ephemeral: true });
  }
};
