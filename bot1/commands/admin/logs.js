const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbAll } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('logs').setDescription('عرض لوقات السيرفر / View logs')
    .addStringOption(o => o.setName('type').setDescription('النوع').addChoices({name:'الكل',value:'all'},{name:'حظر',value:'ban'},{name:'طرد',value:'kick'},{name:'كتم',value:'mute'},{name:'تحذير',value:'warn'}).setRequired(false))
    .addIntegerOption(o => o.setName('limit').setDescription('العدد').setMinValue(1).setMaxValue(20).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),
  async execute(interaction) {
    const type = interaction.options.getString('type') || 'all';
    const limit = interaction.options.getInteger('limit') || 10;
    const logs = type === 'all'
      ? await dbAll('SELECT * FROM logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?', [interaction.guildId, limit])
      : await dbAll('SELECT * FROM logs WHERE guild_id = ? AND type = ? ORDER BY created_at DESC LIMIT ?', [interaction.guildId, type, limit]);
    if (!logs.length) return interaction.reply({ content: '❌ لا توجد لوقات.', ephemeral: true });
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle('📋 لوقات السيرفر')
      .setDescription(logs.map(l => `**${l.type.toUpperCase()}** • <@${l.user_id}> → <@${l.target_id}> • ${l.details||''}`).join('\n'))
      .setFooter({ text: `${logs.length} سجل` });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
