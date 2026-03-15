const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbAll, ensureGuild } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('warns').setDescription('📋 تحذيرات عضو')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    ensureGuild(interaction.guildId);
    const warns = dbAll('SELECT * FROM warnings WHERE guild_id=? AND user_id=? ORDER BY id DESC', [interaction.guildId, user.id]);
    if (!warns.length) return interaction.reply({ content: `✅ **${user.tag}** ليس لديه تحذيرات`, ephemeral: true });
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffa500).setTitle(`⚠️ تحذيرات ${user.tag}`)
      .setDescription(warns.map((w,i) => `**${i+1}.** ${w.reason} — <@${w.moderator_id}>`).join('\n'))
      .setFooter({text:`${warns.length} تحذير`}).setTimestamp()], ephemeral: true });
  }
};
