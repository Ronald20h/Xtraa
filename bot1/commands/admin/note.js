const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, dbAll } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('note').setDescription('📝 إدارة ملاحظات الأعضاء')
    .addSubcommand(s => s.setName('add').setDescription('إضافة ملاحظة')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
      .addStringOption(o => o.setName('note').setDescription('الملاحظة').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('عرض ملاحظات عضو')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('clear').setDescription('مسح ملاحظات عضو')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    if (sub === 'add') {
      const note = interaction.options.getString('note');
      dbRun('INSERT INTO logs (guild_id, type, user_id, target_id, details) VALUES (?,?,?,?,?)',
        [interaction.guildId, 'note', interaction.user.id, user.id, note]);
      await interaction.reply({ content: `✅ تمت إضافة ملاحظة على **${user.tag}**`, ephemeral: true });
    } else if (sub === 'list') {
      const notes = dbAll('SELECT * FROM logs WHERE guild_id=? AND type="note" AND target_id=? ORDER BY id DESC LIMIT 10', [interaction.guildId, user.id]);
      if (!notes.length) return interaction.reply({ content: '📭 لا توجد ملاحظات', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffd700').setTitle(`📝 ملاحظات ${user.tag}`)
        .setDescription(notes.map((n,i) => `**${i+1}.** ${n.details}`).join('\n'))], ephemeral: true });
    } else {
      dbRun('DELETE FROM logs WHERE guild_id=? AND type="note" AND target_id=?', [interaction.guildId, user.id]);
      await interaction.reply({ content: `✅ تم مسح ملاحظات **${user.tag}**`, ephemeral: true });
    }
  }
};
