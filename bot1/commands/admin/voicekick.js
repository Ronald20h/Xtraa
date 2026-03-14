const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addLog } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('voicekick').setDescription('🔊 طرد عضو من القناة الصوتية')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    if (!member?.voice?.channel) return interaction.reply({ content: '❌ العضو ليس في قناة صوتية', ephemeral: true });
    try {
      await member.voice.disconnect();
      addLog(interaction.guildId, 'voicekick', interaction.user.id, member.id, 'طرد صوتي');
      await interaction.reply(`✅ تم طرد **${member.user.tag}** من القناة الصوتية`);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
