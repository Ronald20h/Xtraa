const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbAll, dbRun, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('autoreply').setDescription('💬 الرد التلقائي')
    .addSubcommand(s => s.setName('add').setDescription('إضافة رد')
      .addStringOption(o => o.setName('trigger').setDescription('الكلمة').setRequired(true))
      .addStringOption(o => o.setName('response').setDescription('الرد').setRequired(true))
      .addStringOption(o => o.setName('match').setDescription('نوع المطابقة').addChoices({name:'كاملة',value:'exact'},{name:'يحتوي',value:'contains'},{name:'يبدأ بـ',value:'startswith'},{name:'ينتهي بـ',value:'endswith'})))
    .addSubcommand(s => s.setName('remove').setDescription('حذف رد').addIntegerOption(o => o.setName('id').setDescription('الرقم').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('قائمة الردود'))
    .addSubcommand(s => s.setName('clear').setDescription('حذف كل الردود'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    ensureGuild(interaction.guildId);
    const sub = interaction.options.getSubcommand();
    if (sub === 'add') {
      const t = interaction.options.getString('trigger'); const r = interaction.options.getString('response'); const m = interaction.options.getString('match')||'contains';
      dbRun('INSERT INTO autorespond (guild_id, trigger, response, match_type) VALUES (?,?,?,?)',[interaction.guildId,t,r,m]);
      return interaction.reply({ content: `✅ تم إضافة: \`${t}\` → ${r}`, ephemeral: true });
    }
    if (sub === 'remove') { dbRun('DELETE FROM autorespond WHERE id = ? AND guild_id = ?',[interaction.options.getInteger('id'), interaction.guildId]); return interaction.reply({ content: '✅ تم الحذف', ephemeral: true }); }
    if (sub === 'list') {
      const list = dbAll('SELECT * FROM autorespond WHERE guild_id = ?',[interaction.guildId]);
      if (!list.length) return interaction.reply({ content: '📭 لا توجد ردود', ephemeral: true });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x7c3aed).setTitle(`💬 الردود التلقائية (${list.length})`).setDescription(list.map(r=>`**${r.id}.** \`${r.trigger}\` → ${r.response.slice(0,40)} *(${r.match_type})*`).join('\n'))], ephemeral: true });
    }
    if (sub === 'clear') { dbRun('DELETE FROM autorespond WHERE guild_id = ?',[interaction.guildId]); return interaction.reply({ content: '✅ تم مسح كل الردود', ephemeral: true }); }
  }
};
