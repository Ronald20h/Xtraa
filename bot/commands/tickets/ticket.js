const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { dbRun, dbGet, dbAll, ensureGuild, updateGuild, addLog } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('ticket').setDescription('نظام التذاكر الكامل')
    .addSubcommand(s => s.setName('setup').setDescription('إعداد التذاكر')
      .addChannelOption(o => o.setName('category').setDescription('الفئة').addChannelTypes(ChannelType.GuildCategory))
      .addIntegerOption(o => o.setName('max').setDescription('الحد الأقصى').setMinValue(1).setMaxValue(50))
      .addChannelOption(o => o.setName('log').setDescription('قناة اللوق')))
    .addSubcommand(s => s.setName('panel').setDescription('إرسال لوحة التذاكر')
      .addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true))
      .addStringOption(o => o.setName('title').setDescription('العنوان'))
      .addStringOption(o => o.setName('description').setDescription('الوصف'))
      .addStringOption(o => o.setName('button').setDescription('نص الزرار')))
    .addSubcommand(s => s.setName('close').setDescription('إغلاق التذكرة'))
    .addSubcommand(s => s.setName('claim').setDescription('استلام التذكرة (الإدارة فقط)'))
    .addSubcommand(s => s.setName('add').setDescription('إضافة عضو').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('إزالة عضو').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('rename').setDescription('تغيير اسم التذكرة').addStringOption(o => o.setName('name').setDescription('الاسم الجديد').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('قائمة التذاكر المفتوحة'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    ensureGuild(interaction.guildId);
    const guildData = dbGet('SELECT * FROM guilds WHERE id = ?', [interaction.guildId]);

    if (sub === 'setup') {
      const cat = interaction.options.getChannel('category');
      const max = interaction.options.getInteger('max') || 5;
      const log = interaction.options.getChannel('log');
      updateGuild(interaction.guildId, {
        ticket_category: cat?.id || guildData?.ticket_category || null,
        max_tickets: max,
        ticket_log_channel: log?.id || guildData?.ticket_log_channel || null
      });
      await interaction.reply({ content: `✅ تم إعداد التذاكر!\n📁 الفئة: ${cat?.name || 'غير محدد'}\n🔢 الحد: ${max}\n📋 اللوق: ${log ? `<#${log.id}>` : 'غير محدد'}`, ephemeral: true });

    } else if (sub === 'panel') {
      const ch = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title') || guildData?.ticket_panel_title || '🎫 نظام التذاكر';
      const desc = interaction.options.getString('description') || guildData?.ticket_panel_message || 'اضغط على الزر أدناه لفتح تذكرة دعم 👇';
      const btnLabel = interaction.options.getString('button') || guildData?.ticket_button_label || '🎫 فتح تذكرة';
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle(title).setDescription(desc)
        .setFooter({ text: `${interaction.guild.name} • نظام التذاكر`, iconURL: interaction.guild.iconURL() || undefined });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_open').setLabel(btnLabel).setStyle(ButtonStyle.Primary)
      );
      await ch.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ تم إرسال لوحة التذاكر في <#${ch.id}>`, ephemeral: true });

    } else if (sub === 'close') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة مفتوحة', ephemeral: true });
      // Only ticket owner CAN'T close their own - only admins/mods
      const isAdmin = interaction.member?.permissions.has('Administrator') || interaction.member?.permissions.has('ManageChannels');
      if (!isAdmin) return interaction.reply({ content: '❌ فقط الإدارة يمكنهم إغلاق التذاكر', ephemeral: true });
      dbRun('UPDATE tickets SET status = "closed", closed_at = CURRENT_TIMESTAMP WHERE channel_id = ?', [interaction.channelId]);
      addLog(interaction.guildId, 'ticket_close', interaction.user.id, ticket.user_id, `تذكرة #${ticket.ticket_number}`);
      sendTicketLog(interaction.guild, guildData, 'إغلاق تذكرة', interaction.user, ticket);
      await interaction.reply({ content: '🔒 سيتم إغلاق التذكرة خلال 5 ثواني...' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);

    } else if (sub === 'claim') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة', ephemeral: true });
      if (ticket.user_id === interaction.user.id) return interaction.reply({ content: '❌ لا يمكنك استلام تذكرتك!', ephemeral: true });
      dbRun('UPDATE tickets SET claimed_by = ? WHERE channel_id = ?', [interaction.user.id, interaction.channelId]);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff88').setDescription(`✅ ${interaction.user} استلم هذه التذكرة`)] });

    } else if (sub === 'add') {
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
      await interaction.reply({ content: `✅ تم إضافة ${user} للتذكرة` });

    } else if (sub === 'remove') {
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.delete(user.id);
      await interaction.reply({ content: `✅ تم إزالة ${user} من التذكرة` });

    } else if (sub === 'rename') {
      const name = interaction.options.getString('name');
      await interaction.channel.setName(name.replace(/\s+/g, '-').toLowerCase());
      await interaction.reply({ content: `✅ تم تغيير اسم التذكرة إلى **${name}**` });

    } else if (sub === 'list') {
      const tickets = dbAll('SELECT * FROM tickets WHERE guild_id = ? AND status = "open" ORDER BY id DESC LIMIT 20', [interaction.guildId]);
      if (!tickets.length) return interaction.reply({ content: '📭 لا توجد تذاكر مفتوحة', ephemeral: true });
      const embed = new EmbedBuilder().setColor('#5865f2').setTitle('🎫 التذاكر المفتوحة')
        .setDescription(tickets.map(t => `**#${t.ticket_number || t.id}** — <@${t.user_id}> — <#${t.channel_id}>${t.claimed_by ? ` ✅ <@${t.claimed_by}>` : ''}`).join('\n'));
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};

async function sendTicketLog(guild, guildData, action, user, ticket) {
  try {
    if (!guildData?.ticket_log_channel) return;
    const ch = guild.channels.cache.get(guildData.ticket_log_channel);
    if (!ch) return;
    const embed = new EmbedBuilder().setColor('#5865f2')
      .setTitle(`🎫 سجل التذاكر — ${action}`)
      .addFields(
        { name: '👤 بواسطة', value: `${user.tag}`, inline: true },
        { name: '🎫 التذكرة', value: `#${ticket.ticket_number || ticket.id}`, inline: true },
        { name: '👤 صاحب التذكرة', value: `<@${ticket.user_id}>`, inline: true }
      ).setTimestamp();
    await ch.send({ embeds: [embed] });
  } catch {}
}
