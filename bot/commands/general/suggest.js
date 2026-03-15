const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dbGet, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('suggest').setDescription('💡 إرسال اقتراح')
    .addStringOption(o => o.setName('idea').setDescription('الاقتراح').setRequired(true).setMaxLength(500)),
  async execute(interaction) {
    const idea = interaction.options.getString('idea');
    ensureGuild(interaction.guildId);
    const gData = dbGet('SELECT * FROM guilds WHERE id = ?', [interaction.guildId]);
    const ch = gData?.log_channel ? interaction.guild.channels.cache.get(gData.log_channel) : interaction.channel;
    const embed = new EmbedBuilder().setColor(0x7c3aed).setTitle('💡 اقتراح جديد')
      .setDescription(idea).setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields({ name: '👤 بواسطة', value: `${interaction.user}`, inline: true })
      .setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('suggest_up').setLabel('✅ موافق').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('suggest_down').setLabel('❌ رفض').setStyle(ButtonStyle.Danger),
    );
    const sent = await (ch || interaction.channel).send({ embeds: [embed], components: [row] });
    return interaction.reply({ content: `✅ تم إرسال اقتراحك!`, ephemeral: true });
  }
};
