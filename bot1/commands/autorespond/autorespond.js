const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, dbAll, dbGet, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('autorespond').setDescription('إدارة الردود التلقائية / Auto respond')
    .addSubcommand(s => s.setName('add').setDescription('إضافة رد')
      .addStringOption(o => o.setName('trigger').setDescription('الكلمة المشغلة').setRequired(true))
      .addStringOption(o => o.setName('response').setDescription('الرد').setRequired(true))
      .addStringOption(o => o.setName('type').setDescription('نوع').addChoices({name:'مطابقة كاملة',value:'exact'},{name:'يحتوي على',value:'contains'},{name:'يبدأ بـ',value:'startswith'}).setRequired(false)))
    .addSubcommand(s => s.setName('remove').setDescription('حذف').addIntegerOption(o => o.setName('id').setDescription('الرقم').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('القائمة'))
    .addSubcommand(s => s.setName('toggle').setDescription('تفعيل/تعطيل').addIntegerOption(o => o.setName('id').setDescription('الرقم').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await ensureGuild(interaction.guildId);
    if (sub === 'add') {
      const t = interaction.options.getString('trigger'), r = interaction.options.getString('response'), type = interaction.options.getString('type') || 'exact';
      await dbRun('INSERT INTO autorespond (guild_id, trigger, response, match_type) VALUES (?, ?, ?, ?)', [interaction.guildId, t, r, type]);
      await interaction.reply({ content: `✅ تم إضافة رد: **${t}** → ${r}`, ephemeral: true });
    } else if (sub === 'remove') {
      const id = interaction.options.getInteger('id');
      const res = await dbRun('DELETE FROM autorespond WHERE id = ? AND guild_id = ?', [id, interaction.guildId]);
      await interaction.reply({ content: res.changes ? `✅ تم حذف الرد #${id}` : `❌ لم أجده`, ephemeral: true });
    } else if (sub === 'toggle') {
      const id = interaction.options.getInteger('id');
      const row = await dbGet('SELECT * FROM autorespond WHERE id = ? AND guild_id = ?', [id, interaction.guildId]);
      if (!row) return interaction.reply({ content: '❌ لم أجد الرد', ephemeral: true });
      await dbRun('UPDATE autorespond SET enabled = ? WHERE id = ?', [row.enabled ? 0 : 1, id]);
      await interaction.reply({ content: `✅ الرد #${id} ${row.enabled ? '❌ معطل' : '✅ مفعل'}`, ephemeral: true });
    } else {
      const list = await dbAll('SELECT * FROM autorespond WHERE guild_id = ? ORDER BY id', [interaction.guildId]);
      if (!list.length) return interaction.reply({ content: '❌ لا توجد ردود تلقائية.', ephemeral: true });
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🤖 الردود التلقائية')
        .setDescription(list.map(r => `**#${r.id}** ${r.enabled?'✅':'❌'} \`${r.trigger}\` → ${r.response.substring(0,40)} *(${r.match_type})*`).join('\n'));
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
