const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('move').setDescription('🔀 نقل عضو لقناة صوتية أخرى')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('القناة الهدف').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const ch = interaction.options.getChannel('channel');
    if (!member?.voice?.channel) return interaction.reply({ content: '❌ العضو ليس في قناة صوتية', ephemeral: true });
    try {
      await member.voice.setChannel(ch);
      await interaction.reply(`✅ تم نقل **${member.user.tag}** إلى **${ch.name}**`);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
