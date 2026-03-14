const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('come')
    .setDescription('نداء عضو / Call a member')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('القناة الصوتية').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const user = interaction.options.getMember('user');
    const targetChannel = interaction.options.getChannel('channel') || interaction.member?.voice?.channel;
    if (!user) return interaction.reply({ content: '❌ عضو غير موجود', ephemeral: true });
    if (!user.voice?.channel) return interaction.reply({ content: '❌ العضو ليس في قناة صوتية', ephemeral: true });
    if (!targetChannel) return interaction.reply({ content: '❌ انضم إلى قناة صوتية أولاً', ephemeral: true });
    try {
      await user.voice.setChannel(targetChannel);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2').setDescription(`📢 تم نداء ${user} إلى **${targetChannel.name}**`)] });
    } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
