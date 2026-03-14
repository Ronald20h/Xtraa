const { EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dbGet, dbAll, dbRun, ensureGuild, updateGuild, addLog } = require('../database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      try { await cmd.execute(interaction, client); }
      catch (e) {
        console.error(`Cmd error ${interaction.commandName}:`, e);
        const errMsg = { content: '❌ حدث خطأ!', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(errMsg).catch(() => {});
        else await interaction.reply(errMsg).catch(() => {});
      }
      return;
    }

    // Button interactions
    if (interaction.isButton()) {
      const { customId } = interaction;

      // Open ticket
      if (customId === 'ticket_open') {
        await handleTicketOpen(interaction);
        return;
      }

      // Ticket close confirm
      if (customId === 'ticket_close_confirm') {
        await handleTicketClose(interaction);
        return;
      }

      // Giveaway entry
      if (customId === 'giveaway_enter') {
        await handleGiveawayEntry(interaction);
        return;
      }

      // Decoration copy buttons
      if (customId.startsWith('decor_')) {
        const parts = customId.split('_');
        const text = decodeURIComponent(parts.slice(2).join('_'));
        await interaction.reply({ content: `📋 النص المزخرف:\n\`\`\`${text}\`\`\``, ephemeral: true });
        return;
      }
    }
  }
};

async function handleTicketOpen(interaction) {
  try {
    ensureGuild(interaction.guildId);
    const guildData = dbGet('SELECT * FROM guilds WHERE id = ?', [interaction.guildId]);
    const maxTickets = guildData?.max_tickets || 5;
    const isPremium = dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [interaction.guildId]);

    // Check open tickets for this user
    const userTickets = dbAll('SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = "open"', [interaction.guildId, interaction.user.id]);
    if (userTickets.length >= 1) {
      const ch = interaction.guild.channels.cache.get(userTickets[0].channel_id);
      return interaction.reply({ content: `❌ لديك تذكرة مفتوحة بالفعل! ${ch ? `<#${ch.id}>` : ''}`, ephemeral: true });
    }

    // Check total open tickets
    const allOpen = dbAll('SELECT * FROM tickets WHERE guild_id = ? AND status = "open"', [interaction.guildId]);
    const effectiveMax = isPremium ? 999 : maxTickets;
    if (allOpen.length >= effectiveMax) {
      return interaction.reply({ content: `❌ الحد الأقصى للتذاكر (${effectiveMax}) تم الوصول إليه!`, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    // Count tickets for number
    const totalTickets = dbAll('SELECT * FROM tickets WHERE guild_id = ?', [interaction.guildId]);
    const ticketNum = totalTickets.length + 1;
    const channelName = `ticket-${ticketNum.toString().padStart(4, '0')}`;

    // Create ticket channel
    const category = guildData?.ticket_category ? interaction.guild.channels.cache.get(guildData.ticket_category) : null;
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category || null,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        { id: interaction.guild.members.me.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
      ]
    });

    dbRun('INSERT INTO tickets (guild_id, user_id, channel_id, ticket_number) VALUES (?, ?, ?, ?)',
      [interaction.guildId, interaction.user.id, channel.id, ticketNum]);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎫 تذكرة #${ticketNum.toString().padStart(4, '0')}`)
      .setDescription(`مرحباً ${interaction.user}!\n\nشكراً لتواصلك معنا. سيرد عليك فريق الدعم في أقرب وقت.\n\n> اشرح مشكلتك بالتفصيل.`)
      .addFields(
        { name: '👤 العضو', value: `${interaction.user.tag}`, inline: true },
        { name: '📅 التاريخ', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
      )
      .setFooter({ text: 'استخدم الأزرار أدناه للتحكم في التذكرة' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close_confirm').setLabel('🔒 إغلاق التذكرة').setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: `${interaction.user} | @here`, embeds: [embed], components: [row] });
    await interaction.editReply({ content: `✅ تم فتح تذكرتك! <#${channel.id}>` });

    // Ticket log
    if (guildData?.ticket_log_channel) {
      const logCh = interaction.guild.channels.cache.get(guildData.ticket_log_channel);
      if (logCh) {
        const logEmbed = new EmbedBuilder().setColor('#00ff88').setTitle('🎫 تذكرة جديدة')
          .addFields(
            { name: '👤 العضو', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: '📌 القناة', value: `<#${channel.id}>`, inline: true },
            { name: '🔢 الرقم', value: `#${ticketNum}`, inline: true }
          ).setTimestamp();
        await logCh.send({ embeds: [logEmbed] });
      }
    }

    addLog(interaction.guildId, 'ticket_open', interaction.user.id, null, `تذكرة #${ticketNum}`);
  } catch (e) {
    console.error('Ticket open error:', e);
    if (interaction.deferred) await interaction.editReply({ content: `❌ ${e.message}` }).catch(() => {});
    else await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }).catch(() => {});
  }
}

async function handleTicketClose(interaction) {
  const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
  if (!ticket) return interaction.reply({ content: '❌ لا توجد تذكرة مفتوحة', ephemeral: true });
  dbRun('UPDATE tickets SET status = "closed", closed_at = CURRENT_TIMESTAMP WHERE channel_id = ?', [interaction.channelId]);
  await interaction.reply({ content: '🔒 جارٍ إغلاق التذكرة...' });
  setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
}

async function handleGiveawayEntry(interaction) {
  const ga = dbGet('SELECT * FROM giveaways WHERE message_id = ? AND status = "active"', [interaction.message.id]);
  if (!ga) return interaction.reply({ content: '❌ هذه الهبة منتهية', ephemeral: true });
  const already = dbGet('SELECT * FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?', [ga.id, interaction.user.id]);
  if (already) {
    dbRun('DELETE FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?', [ga.id, interaction.user.id]);
    return interaction.reply({ content: '❌ تم إلغاء مشاركتك في الهبة', ephemeral: true });
  }
  dbRun('INSERT INTO giveaway_entries (giveaway_id, user_id) VALUES (?, ?)', [ga.id, interaction.user.id]);
  const count = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id = ?', [ga.id]).length;
  return interaction.reply({ content: `✅ تم تسجيل مشاركتك! إجمالي المشاركين: **${count}**`, ephemeral: true });
}
