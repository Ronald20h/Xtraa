const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbGet, dbAll, dbRun, ensureGuild, updateGuild } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('protection').setDescription('🛡️ إدارة نظام الحماية')
    .addSubcommand(s => s.setName('status').setDescription('حالة الحماية الحالية'))
    .addSubcommand(s => s.setName('enable-all').setDescription('تفعيل جميع أنظمة الحماية'))
    .addSubcommand(s => s.setName('disable-all').setDescription('إيقاف جميع أنظمة الحماية'))
    .addSubcommand(s => s.setName('toggle').setDescription('تفعيل/إيقاف حماية معينة')
      .addStringOption(o => o.setName('type').setDescription('نوع الحماية').setRequired(true)
        .addChoices(
          {name:'مضاد السبام',value:'anti_spam'},
          {name:'مضاد الروابط',value:'anti_links'},
          {name:'مضاد الكابس',value:'anti_caps'},
          {name:'مضاد المنشن الجماعي',value:'anti_mention'},
          {name:'منع تغيير اسم السيرفر',value:'anti_server_name'},
          {name:'منع تغيير أيقونة السيرفر',value:'anti_server_icon'},
          {name:'مضاد الريد',value:'anti_raid'}
        )))
    .addSubcommand(s => s.setName('whitelist-add').setDescription('إضافة مستخدم للقائمة البيضاء')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
      .addBooleanOption(o => o.setName('bypass-all').setDescription('تجاوز كل الحمايات')))
    .addSubcommand(s => s.setName('whitelist-remove').setDescription('إزالة من القائمة البيضاء')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('whitelist-list').setDescription('عرض القائمة البيضاء'))
    .addSubcommand(s => s.setName('log').setDescription('تعيين قناة سجل الحماية')
      .addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    ensureGuild(interaction.guildId);
    const guildData = dbGet('SELECT * FROM guilds WHERE id = ?', [interaction.guildId]);

    if (sub === 'status') {
      const whitelist = dbAll('SELECT * FROM protection_whitelist WHERE guild_id = ?', [interaction.guildId]);
      const embed = new EmbedBuilder().setColor('#5865f2').setTitle('🛡️ حالة نظام الحماية')
        .addFields(
          { name: '🚫 مضاد السبام', value: guildData.anti_spam ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '🔗 مضاد الروابط', value: guildData.anti_links ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '🔡 مضاد الكابس', value: guildData.anti_caps ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '📢 مضاد المنشن', value: guildData.anti_mention ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '📛 حماية اسم السيرفر', value: guildData.anti_server_name ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '🖼️ حماية أيقونة السيرفر', value: guildData.anti_server_icon ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '⚡ مضاد الريد', value: guildData.anti_raid ? '✅ مفعّل' : '❌ موقوف', inline: true },
          { name: '📋 سجل الحماية', value: guildData.protection_log_channel ? `<#${guildData.protection_log_channel}>` : '❌ غير محدد', inline: true },
          { name: '📝 القائمة البيضاء', value: `${whitelist.length} مستخدم`, inline: true }
        ).setTimestamp();
      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'enable-all') {
      updateGuild(interaction.guildId, { anti_spam:1, anti_links:1, anti_caps:1, anti_mention:1, anti_server_name:1, anti_server_icon:1, anti_raid:1, protection_enabled:1, original_server_name: interaction.guild.name, original_server_icon: interaction.guild.icon });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff88').setTitle('🛡️ تم تفعيل جميع أنظمة الحماية!').setDescription('✅ السبام\n✅ الروابط\n✅ الكابس\n✅ المنشن الجماعي\n✅ حماية اسم السيرفر\n✅ حماية الأيقونة\n✅ مضاد الريد')] });

    } else if (sub === 'disable-all') {
      updateGuild(interaction.guildId, { anti_spam:0, anti_links:0, anti_caps:0, anti_mention:0, anti_server_name:0, anti_server_icon:0, anti_raid:0 });
      await interaction.reply({ content: '❌ تم إيقاف جميع أنظمة الحماية!', ephemeral: true });

    } else if (sub === 'toggle') {
      const type = interaction.options.getString('type');
      const current = guildData[type] || 0;
      updateGuild(interaction.guildId, { [type]: current ? 0 : 1 });
      await interaction.reply({ content: `${current ? '❌ تم إيقاف' : '✅ تم تفعيل'} **${type}**!` });

    } else if (sub === 'whitelist-add') {
      const user = interaction.options.getUser('user');
      const bypassAll = interaction.options.getBoolean('bypass-all') || false;
      dbRun('INSERT OR REPLACE INTO protection_whitelist (guild_id, user_id, added_by, bypass_all) VALUES (?, ?, ?, ?)',
        [interaction.guildId, user.id, interaction.user.id, bypassAll ? 1 : 0]);
      await interaction.reply({ content: `✅ تم إضافة ${user} للقائمة البيضاء${bypassAll ? ' (تجاوز كامل)' : ''}` });

    } else if (sub === 'whitelist-remove') {
      const user = interaction.options.getUser('user');
      dbRun('DELETE FROM protection_whitelist WHERE guild_id = ? AND user_id = ?', [interaction.guildId, user.id]);
      await interaction.reply({ content: `✅ تم إزالة ${user} من القائمة البيضاء` });

    } else if (sub === 'whitelist-list') {
      const list = dbAll('SELECT * FROM protection_whitelist WHERE guild_id = ?', [interaction.guildId]);
      if (!list.length) return interaction.reply({ content: '📭 القائمة البيضاء فارغة', ephemeral: true });
      const embed = new EmbedBuilder().setColor('#ffd700').setTitle('⚪ القائمة البيضاء')
        .setDescription(list.map(w => `<@${w.user_id}> — ${w.bypass_all ? '🔓 تجاوز كامل' : '🔒 جزئي'}`).join('\n'));
      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'log') {
      const ch = interaction.options.getChannel('channel');
      updateGuild(interaction.guildId, { protection_log_channel: ch.id });
      await interaction.reply({ content: `✅ تم تعيين <#${ch.id}> كقناة سجل الحماية` });
    }
  }
};
