const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('deafen').setDescription('🔇 كتم سماع عضو في الصوت')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addBooleanOption(o => o.setName('state').setDescription('تفعيل/إيقاف'))
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const state = interaction.options.getBoolean('state') ?? true;
    if (!member?.voice?.channel) return interaction.reply({ content: '❌ العضو ليس في قناة صوتية', ephemeral: true });
    await member.voice.setDeaf(state);
    await interaction.reply(`${state ? '🔇' : '🔊'} تم ${state ? 'كتم سماع' : 'رفع الكتم عن'} **${member.user.tag}**`);
  }
};
