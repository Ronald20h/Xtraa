const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('announce').setDescription('📢 إرسال إعلان رسمي')
    .addStringOption(o => o.setName('message').setDescription('نص الإعلان').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('القناة (افتراضي: الحالية)'))
    .addStringOption(o => o.setName('title').setDescription('عنوان الإعلان'))
    .addStringOption(o => o.setName('color').setDescription('اللون HEX مثال: #ff0000'))
    .addBooleanOption(o => o.setName('ping').setDescription('منشن @everyone'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const msg = interaction.options.getString('message');
    const ch = interaction.options.getChannel('channel') || interaction.channel;
    const title = interaction.options.getString('title') || '📢 إعلان';
    const color = interaction.options.getString('color') || '#5865f2';
    const ping = interaction.options.getBoolean('ping') || false;
    const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(msg)
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() || undefined })
      .setTimestamp();
    await ch.send({ content: ping ? '@everyone' : '', embeds: [embed] });
    await interaction.reply({ content: `✅ تم إرسال الإعلان في <#${ch.id}>`, ephemeral: true });
  }
};
