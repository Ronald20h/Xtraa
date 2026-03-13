const { dbGet, dbAll, dbRun, ensureGuild } = require('../database');
const { EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      try { await cmd.execute(interaction, client); }
      catch (err) {
        console.error('Cmd error:', err.message);
        const msg = { content: '❌ حدث خطأ.', ephemeral: true };
        if (interaction.replied || interaction.deferred) interaction.followUp(msg).catch(() => {});
        else interaction.reply(msg).catch(() => {});
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'ticket_open') {
        try {
          const guildData = ensureGuild(interaction.guildId);
          const existing = dbGet('SELECT COUNT(*) as c FROM tickets WHERE guild_id = ? AND user_id = ? AND status = "open"', [interaction.guildId, interaction.user.id]);
          if (existing && existing.c >= (guildData.max_tickets || 5))
            return interaction.reply({ content: `❌ وصلت للحد الأقصى (${guildData.max_tickets||5} تذاكر).`, ephemeral: true });
          dbRun('UPDATE guilds SET ticket_count = ticket_count + 1 WHERE id = ?', [interaction.guildId]);
          const g = dbGet('SELECT ticket_count FROM guilds WHERE id = ?', [interaction.guildId]);
          const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}-${g.ticket_count}`,
            type: ChannelType.GuildText,
            parent: guildData.ticket_category || undefined,
            permissionOverwrites: [
              { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
              { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
            ]
          });
          dbRun('INSERT INTO tickets (guild_id, user_id, channel_id) VALUES (?, ?, ?)', [interaction.guildId, interaction.user.id, channel.id]);
          const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎫 تذكرة جديدة')
            .setDescription(`مرحباً ${interaction.user}!\n\nتذكرتك مفتوحة. سيرد عليك الفريق قريباً.`)
            .setFooter({ text: `تذكرة #${g.ticket_count}` }).setTimestamp();
          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_close_btn').setLabel('🔒 إغلاق التذكرة').setStyle(ButtonStyle.Danger));
          await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
          await interaction.reply({ content: `✅ تم فتح تذكرتك: ${channel}`, ephemeral: true });
        } catch (e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }).catch(() => {}); }
      }

      if (interaction.customId === 'ticket_close_btn') {
        const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
        if (!ticket) return interaction.reply({ content: '❌ هذه ليست تذكرة مفتوحة.', ephemeral: true });
        dbRun('UPDATE tickets SET status = "closed", closed_at = CURRENT_TIMESTAMP WHERE channel_id = ?', [interaction.channelId]);
        await interaction.reply({ content: '🔒 سيتم إغلاق التذكرة خلال 5 ثواني...' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }

      if (interaction.customId.startsWith('trivia_')) {
        const correct = interaction.customId.startsWith('trivia_correct');
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(correct?'#00ff88':'#ff4444').setTitle(correct?'🎉 إجابة صحيحة!':'❌ إجابة خاطئة!').setDescription(correct?'أحسنت!':'حظاً أوفر!')], ephemeral: true });
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'help_menu') {
      const cat = interaction.values[0];
      const map = {
        general:['ping','help','serverinfo','userinfo','avatar','botinfo','poll','say','roleinfo','invite','suggest','weather','remindme','translate','shortcut','setlang'],
        admin:['ban','kick','mute','unmute','warn','warnings','clearwarnings','purge','slowmode','lock','unlock','addrole','removerole','nickname','unban','setlog','setwelcome','logs'],
        tickets:['ticket setup','ticket panel','ticket close','ticket claim','ticket add','ticket remove'],
        games:['coinflip','rps','dice','trivia','number','gameimage'],
        protection:['protection status','protection antispam','protection antilinks','protection anticaps','protection antimention'],
        levels:['rank','leaderboard','setxp'],
        embed:['embed create','embed send','embed list','embed delete'],
        autorespond:['autorespond add','autorespond remove','autorespond list','autorespond toggle'],
        premium:['tokencheck','premiuminfo'],
      };
      const catNames = {general:'📋 العامة',admin:'🛡️ الإدارية',tickets:'🎫 التذاكر',games:'🎮 الألعاب',protection:'🔒 الحماية',levels:'📊 المستويات',embed:'💬 الإيمبيد',autorespond:'🤖 الردود التلقائية',premium:'💎 بريميوم'};
      const cmds = map[cat] || [];
      await interaction.update({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle(`${catNames[cat]} — الأوامر`)
        .setDescription(cmds.map(c=>`\`/${c}\``).join('\n') || 'لا توجد أوامر')
        .setFooter({text:`${cmds.length} أمر • Xtra Bot`})] });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'embed_create') {
      const name = interaction.fields.getTextInputValue('embed_name');
      const title = interaction.fields.getTextInputValue('embed_title');
      const desc = interaction.fields.getTextInputValue('embed_desc');
      const color = interaction.fields.getTextInputValue('embed_color') || '#5865F2';
      const footer = interaction.fields.getTextInputValue('embed_footer') || null;
      dbRun('INSERT OR REPLACE INTO embeds (guild_id, name, title, description, color, footer) VALUES (?, ?, ?, ?, ?, ?)', [interaction.guildId, name, title, desc, color, footer]);
      await interaction.reply({ content: `✅ تم إنشاء الإيمبيد **${name}**! استخدم \`/embed send name:${name}\` لإرساله.`, ephemeral: true });
    }
  }
};
