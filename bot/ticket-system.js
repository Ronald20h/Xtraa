const {
  Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder,
  TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js');
const { Database } = require('st.db');
const db = new Database('./Json-db/Bots/ticketDB');
let Trans; try { Trans = require('discord-html-transcripts'); } catch { Trans = null; }

const supportMenu = () => new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder().setCustomId('supportPanel').setPlaceholder('⚙️ لوحة تحكم الدعم')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('تغيير اسم التكت').setValue('renameTicket').setEmoji('✏️'),
      new StringSelectMenuOptionBuilder().setLabel('إضافة عضو').setValue('addMemberToTicket').setEmoji('✅'),
      new StringSelectMenuOptionBuilder().setLabel('إزالة عضو').setValue('removeMemberFromTicket').setEmoji('⛔'),
      new StringSelectMenuOptionBuilder().setLabel('إعادة تحميل').setValue('refreshSupportPanel').setEmoji('🔄'),
    )
);

const mainBtns = () => new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('close').setLabel('🔒 إغلاق').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('claim').setLabel('✋ استلام').setStyle(ButtonStyle.Success)
);

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {

    // ══ فتح تكت ══
    if (interaction.isButton() && interaction.customId === 'create_ticket') {
      const settings = db.get(`TicketSettings_${interaction.guild.id}`);
      if (!settings) return interaction.reply({ content: '❌ لم يتم إعداد نظام التكت. استخدم `/setup-ticket`', ephemeral: true });
      const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
      if (existing) return interaction.reply({ content: `❌ لديك تكت مفتوح: ${existing}`, ephemeral: true });

      if (settings.askReason) {
        const modal = new ModalBuilder().setCustomId('ticket_reason_modal').setTitle('سبب فتح التكت')
          .addComponents(new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('reason').setLabel('ما سبب فتح التكت؟').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)
          ));
        return interaction.showModal(modal);
      }
      await openTicket(interaction, settings);
    }

    // ── Modal سبب الفتح ──
    if (interaction.isModalSubmit() && interaction.customId === 'ticket_reason_modal') {
      const settings = db.get(`TicketSettings_${interaction.guild.id}`);
      if (!settings) return interaction.reply({ content: '❌ خطأ في الإعدادات', ephemeral: true });
      const reason = interaction.fields.getTextInputValue('reason');
      await openTicket(interaction, settings, reason);
    }

    // ══ close (طلب) ══
    if (interaction.isButton() && interaction.customId === 'close') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('Yes11').setLabel('✅ تأكيد الإغلاق').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('No11').setLabel('إلغاء').setStyle(ButtonStyle.Secondary),
      );
      return interaction.reply({ content: '⚠️ **هل أنت متأكد من إغلاق هذا التكت؟**', components: [row] });
    }

    // ══ تأكيد الإغلاق ══
    if (interaction.isButton() && interaction.customId === 'Yes11') {
      const ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
      if (!ticket) return interaction.reply({ content: '❌ هذه القناة ليست تكت.', ephemeral: true });
      await interaction.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: false });
      const e2 = new EmbedBuilder().setColor(0xffa500).setDescription(`🔒 **تم إغلاق التكت** بواسطة ${interaction.user}`).setTimestamp();
      const e3 = new EmbedBuilder().setColor(0x0d0d1a).setDescription('```⚙️ لوحة فريق الدعم```');
      const roww = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('delete').setLabel('🗑️ حذف').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('Open').setLabel('🔓 إعادة فتح').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('Tran').setLabel('📄 Transcript').setStyle(ButtonStyle.Secondary),
      );
      await interaction.deferUpdate();
      await interaction.editReply({ content: '', embeds: [e2, e3], components: [roww] });
      const logId = db.get(`LogsRoom_${interaction.guild.id}`);
      interaction.guild.channels.cache.get(logId)?.send({ embeds: [new EmbedBuilder().setColor(0xffa500).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }).setTitle('🔒 إغلاق تكت').addFields({ name: 'التكت', value: interaction.channel.name, inline: true }, { name: 'المالك', value: `<@${ticket.author}>`, inline: true }, { name: 'بواسطة', value: `${interaction.user}`, inline: true }).setTimestamp()] });
    }

    // ══ إلغاء الإغلاق ══
    if (interaction.isButton() && interaction.customId === 'No11') {
      await interaction.deferUpdate(); await interaction.deleteReply();
    }

    // ══ حذف ══
    if (interaction.isButton() && interaction.customId === 'delete') {
      const ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
      await interaction.reply({ content: '🗑️ سيتم حذف التكت خلال **5 ثوان**...', ephemeral: true });
      const logId = db.get(`LogsRoom_${interaction.guild.id}`);
      interaction.guild.channels.cache.get(logId)?.send({ embeds: [new EmbedBuilder().setColor(0xef4444).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }).setTitle('🗑️ حذف تكت').addFields({ name: 'التكت', value: interaction.channel.name, inline: true }, { name: 'المالك', value: ticket ? `<@${ticket.author}>` : '?', inline: true }, { name: 'بواسطة', value: `${interaction.user}`, inline: true }).setTimestamp()] });
      db.delete(`TICKET-PANEL_${interaction.channel.id}`);
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    // ══ إعادة فتح ══
    if (interaction.isButton() && interaction.customId === 'Open') {
      const ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
      if (ticket) await interaction.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: true, SendMessages: true });
      await interaction.deferUpdate(); await interaction.deleteReply();
      await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0x10b981).setDescription(`🔓 تم إعادة فتح التكت بواسطة ${interaction.user}`).setTimestamp()] });
    }

    // ══ Transcript ══
    if (interaction.isButton() && interaction.customId === 'Tran') {
      if (!Trans) return interaction.reply({ content: '❌ مكتبة discord-html-transcripts غير مثبّتة', ephemeral: true });
      const logId = db.get(`LogsRoom_${interaction.guild.id}`);
      const logCh = interaction.guild.channels.cache.get(logId);
      if (!logCh) return interaction.reply({ content: '❌ لم يتم تحديد روم اللوج — استخدم `/set-ticket-log`', ephemeral: true });
      const ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
      const attachment = await Trans.createTranscript(interaction.channel);
      await logCh.send({ embeds: [new EmbedBuilder().setColor(0x7c3aed).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }).setTitle('📄 Transcript').addFields({ name: 'التكت', value: interaction.channel.name, inline: true }, { name: 'المالك', value: ticket ? `<@${ticket.author}>` : '?', inline: true }, { name: 'بواسطة', value: `${interaction.user}`, inline: true }).setTimestamp()], files: [attachment] });
      await interaction.reply({ content: '✅ تم حفظ الـ Transcript في روم اللوج.', ephemeral: true });
    }

    // ══ Claim ══
    if (interaction.isButton() && interaction.customId === 'claim') {
      const support = db.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;
      if (support && !interaction.member.roles.cache.has(support) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: '❌ فقط فريق الدعم يمكنه الاستلام', ephemeral: true });
      db.set(`Claimed_${interaction.channel.id}`, interaction.user.id);
      if (support) await interaction.channel.permissionOverwrites.edit(support, { SendMessages: false });
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true });
      const claimRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close').setLabel('🔒 إغلاق').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('_d_').setLabel(`✅ استُلم بواسطة ${interaction.user.username}`).setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('unclaim').setLabel('↩️ إلغاء الاستلام').setStyle(ButtonStyle.Primary),
      );
      await interaction.deferUpdate();
      await interaction.editReply({ components: [claimRow, supportMenu()] });
      await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription(`✋ **${interaction.user}** قام باستلام التكت`).setTimestamp()] });
    }

    // ══ UnClaim ══
    if (interaction.isButton() && interaction.customId === 'unclaim') {
      const claimed = db.get(`Claimed_${interaction.channel.id}`);
      if (claimed !== interaction.user.id) return interaction.reply({ content: '❌ أنت لم تستلم هذا التكت', ephemeral: true });
      const support = db.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;
      if (support) await interaction.channel.permissionOverwrites.edit(support, { SendMessages: true });
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: false });
      db.delete(`Claimed_${interaction.channel.id}`);
      await interaction.deferUpdate();
      await interaction.editReply({ components: [mainBtns(), supportMenu()] });
      await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0xffa500).setDescription(`↩️ **${interaction.user}** ألغى استلام التكت`).setTimestamp()] });
    }

    // ══ لوحة الدعم (select menu) ══
    if (interaction.isStringSelectMenu() && interaction.customId === 'supportPanel') {
      const val = interaction.values[0];
      const support = db.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;
      const canManage = (support && interaction.member.roles.cache.has(support)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      if (!canManage) return interaction.reply({ content: '❌ فقط فريق الدعم', ephemeral: true });

      if (val === 'renameTicket') {
        return interaction.showModal(new ModalBuilder().setCustomId('rename_modal').setTitle('تغيير اسم التكت')
          .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('الاسم الجديد').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50))));
      }
      if (val === 'addMemberToTicket') {
        return interaction.showModal(new ModalBuilder().setCustomId('addmem_modal').setTitle('إضافة عضو للتكت')
          .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID العضو').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(20))));
      }
      if (val === 'removeMemberFromTicket') {
        return interaction.showModal(new ModalBuilder().setCustomId('remmem_modal').setTitle('إزالة عضو من التكت')
          .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID العضو').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(20))));
      }
      if (val === 'refreshSupportPanel') {
        await interaction.deferUpdate();
        await interaction.editReply({ components: [mainBtns(), supportMenu()] });
      }
    }

    // ══ Modals ══
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'rename_modal') {
        const name = interaction.fields.getTextInputValue('name').toLowerCase().replace(/\s+/g, '-');
        await interaction.channel.setName(name);
        return interaction.reply({ content: `✅ تم تغيير الاسم إلى **${name}**`, ephemeral: true });
      }
      if (interaction.customId === 'addmem_modal') {
        const id = interaction.fields.getTextInputValue('id').trim();
        const member = interaction.guild.members.cache.get(id) || await interaction.guild.members.fetch(id).catch(() => null);
        if (!member) return interaction.reply({ content: '❌ لم يتم إيجاد العضو', ephemeral: true });
        await interaction.channel.permissionOverwrites.edit(member.id, { ViewChannel: true, SendMessages: true });
        return interaction.reply({ content: `✅ تم إضافة ${member} للتكت` });
      }
      if (interaction.customId === 'remmem_modal') {
        const id = interaction.fields.getTextInputValue('id').trim();
        const ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
        if (id === String(ticket?.author)) return interaction.reply({ content: '❌ لا يمكن إزالة صاحب التكت', ephemeral: true });
        await interaction.channel.permissionOverwrites.edit(id, { ViewChannel: false }).catch(() => {});
        return interaction.reply({ content: '✅ تم إزالة العضو', ephemeral: true });
      }
    }

  });
  console.log('✅ Ticket system loaded');
};

async function openTicket(interaction, settings, reason = null) {
  try {
    await interaction.deferReply({ ephemeral: true });
    const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
    if (existing) return interaction.editReply({ content: `❌ لديك تكت مفتوح: ${existing}` });

    const ch = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: settings.categoryId || null,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
        { id: settings.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
        { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
      ]
    });

    db.set(`TICKET-PANEL_${ch.id}`, { author: interaction.user.id, Support: settings.supportRoleId, guildId: interaction.guild.id, createdAt: Date.now() });

    const embed = new EmbedBuilder().setColor(0x7c3aed).setTitle('🎫 تكت جديد')
      .setDescription(settings.description || 'مرحباً! اكتب مشكلتك وسيتم الرد عليك قريباً.')
      .addFields({ name: '👤 فُتح بواسطة', value: `${interaction.user}`, inline: true }, { name: '🕐 الوقت', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true })
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })).setTimestamp();

    await ch.send({ content: `${interaction.user} <@&${settings.supportRoleId}>`, embeds: [embed], components: [mainBtns(), supportMenu()] });

    if (reason) await ch.send({ embeds: [new EmbedBuilder().setColor(0x7c3aed).setDescription(`**📝 سبب الفتح:**\n\`\`\`${reason}\`\`\``).setTimestamp()] });

    const logId = db.get(`LogsRoom_${interaction.guild.id}`);
    interaction.guild.channels.cache.get(logId)?.send({ embeds: [new EmbedBuilder().setColor(0x10b981).setTitle('🎫 تكت جديد').addFields({ name: '👤 صاحب التكت', value: `${interaction.user}`, inline: true }, { name: '📌 القناة', value: `${ch}`, inline: true }).setTimestamp()] });

    await interaction.editReply({ content: `✅ تم فتح تكتك: ${ch}` });
  } catch (e) { console.error('[openTicket]', e); interaction.editReply({ content: '❌ حدث خطأ.' }).catch(() => {}); }
}
