const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits,
  ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js');
const { dbRun, dbGet, dbAll, ensureGuild, updateGuild, addLog } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('🎫 نظام التذاكر الكامل')
    .addSubcommand(s => s.setName('setup').setDescription('إعداد التذاكر')
      .addChannelOption(o => o.setName('category').setDescription('فئة التذاكر').addChannelTypes(ChannelType.GuildCategory))
      .addIntegerOption(o => o.setName('max').setDescription('الحد الأقصى للتذاكر').setMinValue(1).setMaxValue(50))
      .addChannelOption(o => o.setName('log').setDescription('قناة اللوق')))
    .addSubcommand(s => s.setName('panel').setDescription('نشر لوحة التذاكر في قناة')
      .addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true))
      .addStringOption(o => o.setName('title').setDescription('عنوان اللوحة'))
      .addStringOption(o => o.setName('description').setDescription('وصف اللوحة'))
      .addStringOption(o => o.setName('button').setDescription('نص الزرار'))
      .addStringOption(o => o.setName('color').setDescription('لون الزرار').addChoices(
        { name: '🔵 أزرق (افتراضي)', value: 'Primary' },
        { name: '🟢 أخضر', value: 'Success' },
        { name: '🔴 أحمر', value: 'Danger' },
        { name: '⚫ رمادي', value: 'Secondary' },
      )))
    .addSubcommand(s => s.setName('close').setDescription('🔒 إغلاق التذكرة الحالية'))
    .addSubcommand(s => s.setName('delete').setDescription('🗑️ حذف التذكرة نهائياً'))
    .addSubcommand(s => s.setName('claim').setDescription('✋ استلام التذكرة'))
    .addSubcommand(s => s.setName('unclaim').setDescription('↩️ إلغاء استلام التذكرة'))
    .addSubcommand(s => s.setName('add').setDescription('➕ إضافة عضو للتذكرة')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('➖ إزالة عضو من التذكرة')
      .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('rename').setDescription('✏️ تغيير اسم التذكرة')
      .addStringOption(o => o.setName('name').setDescription('الاسم الجديد').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('📋 قائمة التذاكر المفتوحة'))
    .addSubcommand(s => s.setName('info').setDescription('ℹ️ معلومات التذكرة الحالية'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    ensureGuild(interaction.guildId);
    const gData = dbGet('SELECT * FROM guilds WHERE id = ?', [interaction.guildId]);

    // ── setup ──
    if (sub === 'setup') {
      const cat = interaction.options.getChannel('category');
      const max = interaction.options.getInteger('max') || 5;
      const log = interaction.options.getChannel('log');
      updateGuild(interaction.guildId, {
        ticket_category:    cat?.id || gData?.ticket_category || null,
        max_tickets:        max,
        ticket_log_channel: log?.id || gData?.ticket_log_channel || null
      });
      return interaction.reply({ embeds: [
        new EmbedBuilder().setColor(0x10b981).setTitle('✅ تم إعداد التذاكر!')
          .addFields(
            { name: '📁 الفئة',    value: cat ? `\`${cat.name}\`` : '`غير محدد`',   inline: true },
            { name: '🔢 الحد',     value: `\`${max}\``,                              inline: true },
            { name: '📋 اللوق',    value: log ? `<#${log.id}>` : '`غير محدد`',       inline: true },
          ).setTimestamp()
      ], ephemeral: true });
    }

    // ── panel ──
    if (sub === 'panel') {
      const ch      = interaction.options.getChannel('channel');
      const title   = interaction.options.getString('title')       || gData?.ticket_panel_title   || '🎫 نظام التذاكر';
      const desc    = interaction.options.getString('description')  || gData?.ticket_panel_message || 'اضغط على الزر أدناه لفتح تذكرة دعم 👇\n\nسيتم الرد عليك في أقرب وقت ممكن ✨';
      const btnLbl  = interaction.options.getString('button')       || gData?.ticket_button_label  || '🎫 فتح تذكرة';
      const color   = interaction.options.getString('color')        || gData?.ticket_button_color  || 'Primary';

      const embed = new EmbedBuilder()
        .setColor(0x7c3aed).setTitle(title).setDescription(desc)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() || undefined })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_open').setLabel(btnLbl).setStyle(ButtonStyle[color])
      );

      await ch.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: `✅ تم نشر لوحة التذاكر في <#${ch.id}>`, ephemeral: true });
    }

    // ── close ──
    if (sub === 'close') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة مفتوحة', ephemeral: true });

      const isAdmin = interaction.member?.permissions.has('Administrator') || interaction.member?.permissions.has('ManageChannels');
      if (!isAdmin && ticket.user_id !== interaction.user.id)
        return interaction.reply({ content: '❌ ليس لديك صلاحية إغلاق هذه التذكرة', ephemeral: true });

      // رسالة تأكيد مع أزرار
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tkt_close_yes').setLabel('✅ تأكيد الإغلاق').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('tkt_close_no').setLabel('إلغاء').setStyle(ButtonStyle.Secondary),
      );
      return interaction.reply({ content: '⚠️ **هل أنت متأكد من إغلاق هذه التذكرة؟**', components: [row] });
    }

    // ── delete ──
    if (sub === 'delete') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status IN ("open","closed")', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة', ephemeral: true });
      await interaction.reply({ content: '🗑️ سيتم حذف التذكرة خلال 5 ثواني...' });
      dbRun('UPDATE tickets SET status = "deleted" WHERE channel_id = ?', [interaction.channelId]);
      ticketLog(interaction.guild, gData, '🗑️ حذف تذكرة', interaction.user, ticket);
      addLog(interaction.guildId, 'ticket_delete', interaction.user.id, ticket.user_id, `#${ticket.ticket_number}`);
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    // ── claim ──
    if (sub === 'claim') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست تذكرة مفتوحة', ephemeral: true });
      if (ticket.user_id === interaction.user.id)
        return interaction.reply({ content: '❌ لا يمكنك استلام تذكرتك الخاصة!', ephemeral: true });

      dbRun('UPDATE tickets SET claimed_by = ? WHERE channel_id = ?', [interaction.user.id, interaction.channelId]);
      return interaction.reply({ embeds: [
        new EmbedBuilder().setColor(0x10b981)
          .setDescription(`✅ **${interaction.user}** استلم هذه التذكرة وسيتولى متابعتها`)
          .setTimestamp()
      ]});
    }

    // ── unclaim ──
    if (sub === 'unclaim') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND claimed_by = ?', [interaction.channelId, interaction.user.id]);
      if (!ticket) return interaction.reply({ content: '❌ لم تستلم هذه التذكرة', ephemeral: true });
      dbRun('UPDATE tickets SET claimed_by = NULL WHERE channel_id = ?', [interaction.channelId]);
      return interaction.reply({ embeds: [
        new EmbedBuilder().setColor(0xffa500)
          .setDescription(`↩️ **${interaction.user}** ألغى استلام التذكرة`)
          .setTimestamp()
      ]});
    }

    // ── add ──
    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      return interaction.reply({ content: `✅ تم إضافة ${user} للتذكرة` });
    }

    // ── remove ──
    if (sub === 'remove') {
      const user = interaction.options.getUser('user');
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ?', [interaction.channelId]);
      if (ticket?.user_id === user.id) return interaction.reply({ content: '❌ لا يمكن إزالة صاحب التذكرة', ephemeral: true });
      await interaction.channel.permissionOverwrites.delete(user.id);
      return interaction.reply({ content: `✅ تم إزالة ${user} من التذكرة`, ephemeral: true });
    }

    // ── rename ──
    if (sub === 'rename') {
      const name = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-').slice(0, 50);
      await interaction.channel.setName(name);
      return interaction.reply({ content: `✅ تم تغيير الاسم إلى **${name}**` });
    }

    // ── list ──
    if (sub === 'list') {
      const tickets = dbAll('SELECT * FROM tickets WHERE guild_id = ? AND status = "open" ORDER BY id DESC LIMIT 25', [interaction.guildId]);
      if (!tickets.length) return interaction.reply({ content: '📭 لا توجد تذاكر مفتوحة', ephemeral: true });
      return interaction.reply({ embeds: [
        new EmbedBuilder().setColor(0x7c3aed).setTitle(`🎫 التذاكر المفتوحة (${tickets.length})`)
          .setDescription(tickets.map(t =>
            `**#${String(t.ticket_number||t.id).padStart(4,'0')}** <@${t.user_id}> — <#${t.channel_id}>${t.claimed_by ? ` ✅ <@${t.claimed_by}>` : ''}`
          ).join('\n'))
          .setTimestamp()
      ], ephemeral: true });
    }

    // ── info ──
    if (sub === 'info') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ?', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة', ephemeral: true });
      return interaction.reply({ embeds: [
        new EmbedBuilder().setColor(0x7c3aed).setTitle(`🎫 معلومات التذكرة #${String(ticket.ticket_number||ticket.id).padStart(4,'0')}`)
          .addFields(
            { name: '👤 صاحب التذكرة',  value: `<@${ticket.user_id}>`, inline: true },
            { name: '📊 الحالة',          value: ticket.status === 'open' ? '🟢 مفتوحة' : '🔴 مغلقة', inline: true },
            { name: '✋ مستلم بواسطة',   value: ticket.claimed_by ? `<@${ticket.claimed_by}>` : 'لا أحد', inline: true },
            { name: '📅 تاريخ الفتح',    value: `<t:${Math.floor(new Date(ticket.created_at).getTime()/1000)}:R>`, inline: true },
          ).setTimestamp()
      ], ephemeral: true });
    }
  }
};

function ticketLog(guild, gData, action, user, ticket) {
  try {
    if (!gData?.ticket_log_channel) return;
    const ch = guild.channels.cache.get(gData.ticket_log_channel);
    if (!ch) return;
    ch.send({ embeds: [new EmbedBuilder().setColor(0x5865f2)
      .setTitle(`🎫 ${action}`)
      .addFields(
        { name: '👤 بواسطة',       value: user.tag, inline: true },
        { name: '🎫 رقم التذكرة', value: `#${String(ticket.ticket_number||ticket.id).padStart(4,'0')}`, inline: true },
        { name: '👤 صاحب التذكرة', value: `<@${ticket.user_id}>`, inline: true },
      ).setTimestamp()
    ]}).catch(() => {});
  } catch {}
}
