const { EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dbGet, dbAll, dbRun, ensureGuild, updateGuild, addLog } = require('../database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── Slash Commands ──
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      try { await cmd.execute(interaction, client); }
      catch (e) {
        console.error(`Cmd error [${interaction.commandName}]:`, e.message);
        const msg = { content: '❌ حدث خطأ أثناء تنفيذ الأمر!', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {});
        else await interaction.reply(msg).catch(() => {});
      }
      return;
    }

    // ── Select Menu: help categories ──
    if (interaction.isStringSelectMenu() && interaction.customId === 'help_select') {
      const helpCmd = client.commands.get('help');
      const CATEGORIES = helpCmd?.CATEGORIES;
      if (!CATEGORIES) return;
      const cat = CATEGORIES[interaction.values[0]];
      if (!cat) return;
      const embed = new EmbedBuilder()
        .setColor(cat.color || '#5865f2')
        .setTitle(`${cat.emoji} ${interaction.values[0]}`)
        .setDescription([
          `**${cat.commands.length} أمر** في هذه الفئة`,
          '',
          cat.commands.map(c => {
            const aliases = c.a?.length ? ` — اختصارات: ${c.a.slice(0,4).map(a=>`\`${a}\``).join(' ')}` : '';
            return `**\`/${c.n}\`**${aliases}`;
          }).join('\n')
        ].join('\n'))
        .setFooter({ text: 'كل الأوامر تعمل بدون برفكس! • Xtra Bot v2.0' });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // ── Buttons ──
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'ticket_open') { await handleTicketOpen(interaction); return; }
      if (customId === 'ticket_close_confirm') { await handleTicketClose(interaction); return; }
      if (customId === 'giveaway_enter') { await handleGiveawayEntry(interaction); return; }

      if (customId.startsWith('decor_')) {
        const text = decodeURIComponent(customId.split('_').slice(2).join('_'));
        await interaction.reply({ content: `📋 انسخ النص:\n\`\`\`${text}\`\`\``, ephemeral: true });
        return;
      }
    }
  }
};

async function handleTicketOpen(interaction) {
  try {
    ensureGuild(interaction.guildId);
    const guildData = dbGet('SELECT * FROM guilds WHERE id = ?', [interaction.guildId]);
    const isPremium = dbGet('SELECT * FROM premium_servers WHERE guild_id = ?', [interaction.guildId]);
    const userTickets = dbAll('SELECT * FROM tickets WHERE guild_id=? AND user_id=? AND status="open"', [interaction.guildId, interaction.user.id]);
    if (userTickets.length >= 1) {
      const ch = interaction.guild.channels.cache.get(userTickets[0].channel_id);
      return interaction.reply({ content: `❌ لديك تذكرة مفتوحة! ${ch?`<#${ch.id}>`:''}`, ephemeral: true });
    }
    const allOpen = dbAll('SELECT * FROM tickets WHERE guild_id=? AND status="open"', [interaction.guildId]);
    const maxT = isPremium ? 9999 : (guildData?.max_tickets || 5);
    if (allOpen.length >= maxT) return interaction.reply({ content: `❌ وصلنا للحد الأقصى (${maxT} تذكرة)`, ephemeral: true });

    await interaction.deferReply({ ephemeral: true });
    const totalTickets = dbAll('SELECT * FROM tickets WHERE guild_id=?', [interaction.guildId]);
    const ticketNum = totalTickets.length + 1;
    const category = guildData?.ticket_category ? interaction.guild.channels.cache.get(guildData.ticket_category) : null;
    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticketNum.toString().padStart(4,'0')}`,
      type: ChannelType.GuildText,
      parent: category || null,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        { id: interaction.guild.members.me.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
      ]
    });
    dbRun('INSERT INTO tickets (guild_id, user_id, channel_id, ticket_number) VALUES (?,?,?,?)', [interaction.guildId, interaction.user.id, channel.id, ticketNum]);
    const embed = new EmbedBuilder().setColor('#5865f2')
      .setTitle(`🎫 تذكرة #${ticketNum.toString().padStart(4,'0')}`)
      .setDescription(`مرحباً ${interaction.user}!\n\nسيرد عليك الفريق قريباً.\n> اشرح مشكلتك بالتفصيل.`)
      .addFields({ name:'👤',value:interaction.user.tag,inline:true }, { name:'📅',value:`<t:${Math.floor(Date.now()/1000)}:F>`,inline:true })
      .setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close_confirm').setLabel('🔒 إغلاق').setStyle(ButtonStyle.Danger)
    );
    await channel.send({ content:`${interaction.user}`, embeds:[embed], components:[row] });
    await interaction.editReply({ content:`✅ تذكرتك جاهزة! <#${channel.id}>` });
    if (guildData?.ticket_log_channel) {
      const lch = interaction.guild.channels.cache.get(guildData.ticket_log_channel);
      if (lch) await lch.send({ embeds:[new EmbedBuilder().setColor('#00ff88').setTitle('🎫 تذكرة جديدة')
        .addFields({ name:'👤',value:`${interaction.user.tag}`,inline:true }, { name:'📌',value:`<#${channel.id}>`,inline:true }, { name:'#',value:`${ticketNum}`,inline:true }).setTimestamp()] });
    }
    addLog(interaction.guildId, 'ticket_open', interaction.user.id, null, `#${ticketNum}`);
  } catch(e) {
    console.error('Ticket error:', e.message);
    const msg = { content: `❌ ${e.message}`, ephemeral: true };
    if (interaction.deferred) await interaction.editReply(msg).catch(()=>{});
    else await interaction.reply(msg).catch(()=>{});
  }
}

async function handleTicketClose(interaction) {
  const ticket = dbGet('SELECT * FROM tickets WHERE channel_id=? AND status="open"', [interaction.channelId]);
  if (!ticket) return interaction.reply({ content:'❌ لا توجد تذكرة مفتوحة', ephemeral:true });
  dbRun('UPDATE tickets SET status="closed", closed_at=CURRENT_TIMESTAMP WHERE channel_id=?', [interaction.channelId]);
  await interaction.reply({ content:'🔒 إغلاق خلال 5 ثواني...' });
  setTimeout(() => interaction.channel.delete().catch(()=>{}), 5000);
}

async function handleGiveawayEntry(interaction) {
  const ga = dbGet('SELECT * FROM giveaways WHERE message_id=? AND status="active"', [interaction.message.id]);
  if (!ga) return interaction.reply({ content:'❌ هذه الهبة منتهية', ephemeral:true });
  const already = dbGet('SELECT * FROM giveaway_entries WHERE giveaway_id=? AND user_id=?', [ga.id, interaction.user.id]);
  if (already) {
    dbRun('DELETE FROM giveaway_entries WHERE giveaway_id=? AND user_id=?', [ga.id, interaction.user.id]);
    return interaction.reply({ content:'❌ تم إلغاء مشاركتك', ephemeral:true });
  }
  dbRun('INSERT INTO giveaway_entries (giveaway_id, user_id) VALUES (?,?)', [ga.id, interaction.user.id]);
  const count = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id=?', [ga.id]).length;
  return interaction.reply({ content:`✅ تم تسجيل مشاركتك! المشاركون: **${count}**`, ephemeral:true });
}
