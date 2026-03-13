const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { dbAll } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('warnings').setDescription('عرض تحذيرات / View warnings')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const warns = await dbAll('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC', [interaction.guildId, user.id]);
    if (!warns.length) return interaction.reply({ content: `✅ ${user.tag} لا يوجد لديه تحذيرات.`, ephemeral: true });
    const embed = new EmbedBuilder().setColor('#ffa500').setTitle(`⚠️ تحذيرات ${user.tag}`)
      .setDescription(warns.slice(0,10).map((w,i) => `**${i+1}.** ${w.reason} • <@${w.moderator_id}>`).join('\n'))
      .setFooter({ text: `إجمالي: ${warns.length}` });
    await interaction.reply({ embeds: [embed] });
  }
};
