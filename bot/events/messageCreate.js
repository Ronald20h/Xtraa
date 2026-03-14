const { dbGet, dbAll, dbRun, ensureGuild, addLog } = require('../database');
const { SHORTCUT_MAP, BUILTIN_SHORTCUTS } = require('../utils/shortcuts');
const spamMap = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    try {
      ensureGuild(message.guild.id);
      const guild = dbGet('SELECT * FROM guilds WHERE id = ?', [message.guild.id]);
      const raw = message.content.trim();
      const parts = raw.split(/\s+/);
      const inputCmd = parts[0].toLowerCase();
      const inputArgs = parts.slice(1);

      // ══ STEP 1: RESOLVE COMMAND NAME ══
      // Priority: 1) Custom shortcuts from DB  2) Built-in shortcuts
      let resolvedCmd = null;

      // Check custom shortcuts first (from dashboard)
      const customShortcuts = dbAll('SELECT * FROM shortcuts WHERE guild_id = ?', [message.guild.id]);
      const customMatch = customShortcuts.find(s => s.shortcut.toLowerCase() === inputCmd);
      if (customMatch) {
        resolvedCmd = customMatch.command_name;
      }

      // Fall back to built-in shortcuts
      if (!resolvedCmd) {
        resolvedCmd = SHORTCUT_MAP.get(inputCmd) || null;
      }

      if (!resolvedCmd) {
        // Not a command at all — go to auto-respond, AFK, XP, protection
        await handlePassthrough(message, client, guild);
        return;
      }

      // ══ STEP 2: EXECUTE RESOLVED COMMAND ══
      const handled = await executeCommand(message, client, resolvedCmd, inputArgs, guild);
      if (!handled) {
        // If text handler doesn't cover it, hint the slash command
        await message.reply({
          content: `⚡ اكتب **\`/${resolvedCmd}\`** للتنفيذ الكامل`,
          allowedMentions: { repliedUser: false }
        }).catch(() => {});
      }

    } catch (err) { /* silent */ }
  }
};

// ══════════════════════════════════════════
//  COMMAND EXECUTOR
// ══════════════════════════════════════════
async function executeCommand(message, client, cmd, args, guild) {
  const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
  const isMod  = message.member?.permissions.has('ManageMessages');
  const isAdmin = message.member?.permissions.has('Administrator');
  const mention = message.mentions.members?.first();
  const mentionUser = message.mentions.users?.first();

  switch (cmd) {

    // ─────────── GENERAL ───────────
    case 'ping': {
      const s = Date.now();
      const m = await message.reply('🏓');
      await m.edit(`🏓 **Pong!**\n> 📡 \`${Date.now()-s}ms\`  💓 WS \`${client.ws.ping}ms\``);
      return true;
    }

    case 'avatar': {
      const u = mentionUser || message.author;
      await message.reply({ embeds: [
        new EmbedBuilder().setColor('#5865f2')
          .setTitle(`🖼️ ${u.username}`)
          .setImage(u.displayAvatarURL({ dynamic: true, size: 1024 }))
      ]});
      return true;
    }

    case 'userinfo': {
      const mem = mention || message.member;
      const u = mem.user;
      await message.reply({ embeds: [
        new EmbedBuilder().setColor('#5865f2')
          .setTitle(`👤 ${u.tag}`)
          .setThumbnail(u.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '🆔 ID', value: `\`${u.id}\``, inline: true },
            { name: '📅 أنشئ منذ', value: `<t:${Math.floor(u.createdTimestamp/1000)}:R>`, inline: true },
            { name: '📥 انضم منذ', value: `<t:${Math.floor(mem.joinedTimestamp/1000)}:R>`, inline: true },
            { name: '🎭 الرتب', value: mem.roles.cache.filter(r=>r.id!==message.guild.id).map(r=>r.toString()).slice(0,10).join(' ') || 'لا يوجد' }
          ).setTimestamp()
      ]});
      return true;
    }

    case 'serverinfo': {
      const g = message.guild;
      await message.reply({ embeds: [
        new EmbedBuilder().setColor('#5865f2')
          .setTitle(`🌐 ${g.name}`)
          .setThumbnail(g.iconURL({ dynamic: true }) || '')
          .addFields(
            { name: '👑 المالك', value: `<@${g.ownerId}>`, inline: true },
            { name: '👥 الأعضاء', value: `${g.memberCount}`, inline: true },
            { name: '📅 أنشئ', value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`, inline: true },
            { name: '💬 القنوات', value: `${g.channels.cache.size}`, inline: true },
            { name: '🎭 الرتب', value: `${g.roles.cache.size}`, inline: true },
            { name: '🆔 ID', value: `\`${g.id}\``, inline: true }
          ).setTimestamp()
      ]});
      return true;
    }

    case 'help': {
      const embed = new EmbedBuilder().setColor('#5865f2')
        .setTitle('⚡ Xtra Bot — الأوامر')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription([
          '> الأوامر تشتغل **بدون برفكس** أو بـ **/**',
          '',
          '**🌐 عام**',
          '`ping` `avatar` `userinfo` `serverinfo` `rank` `lb`',
          '`afk` `زخرف` `ضريبة` `say` `poll` `suggest`',
          '',
          '**🛡️ إدارة**',
          '`ban` `kick` `mute` `unmute` `warn` `warnings`',
          '`purge` `lock` `unlock` `slowmode` `rename` `come`',
          '',
          '**🎫 تذاكر:** `/ticket setup` `/ticket panel`',
          '**🎮 ألعاب:** `roulette` `xo` `dice` `coinflip` `rps` `خمن`',
          '**🎉 هبات:** `giveaway` `هبة`',
          '',
          '> اكتب `/help` للقائمة الكاملة بالاختصارات'
        ].join('\n'))
        .setFooter({ text: 'Xtra Bot v2.0 • بدون برفكس 🚀' });
      await message.reply({ embeds: [embed] });
      return true;
    }

    case 'rank': {
      const tMem = mention || message.member;
      const uid = tMem.id || tMem.user?.id;
      const data = dbGet('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?', [message.guild.id, uid]);
      if (!data) { await message.reply('📊 لا يوجد XP بعد!'); return true; }
      const all = dbAll('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC', [message.guild.id]);
      const rank = all.findIndex(m => m.user_id === uid) + 1;
      const nextXP = Math.pow(data.level + 1, 2) * 50;
      const pct = Math.min(100, Math.floor((data.xp / nextXP) * 100));
      const bar = '█'.repeat(Math.floor(pct/10)) + '░'.repeat(10 - Math.floor(pct/10));
      await message.reply({ embeds: [
        new EmbedBuilder().setColor('#5865f2')
          .setTitle(`📊 ${tMem.user?.username || tMem.username}`)
          .setThumbnail(tMem.user?.displayAvatarURL({ dynamic:true }) || tMem.displayAvatarURL?.({ dynamic:true }))
          .addFields(
            { name: '🏆 المستوى', value: `\`${data.level}\``, inline: true },
            { name: '⭐ XP', value: `\`${data.xp} / ${nextXP}\``, inline: true },
            { name: '🥇 الترتيب', value: `\`#${rank}\``, inline: true },
            { name: '📈 التقدم', value: `\`${bar}\` ${pct}%` }
          )
      ]});
      return true;
    }

    case 'leaderboard': {
      const top = dbAll('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT 10', [message.guild.id]);
      if (!top.length) { await message.reply('📭 لا يوجد بيانات!'); return true; }
      const medals = ['🥇','🥈','🥉'];
      await message.reply({ embeds: [
        new EmbedBuilder().setColor('#ffd700').setTitle('🏆 لوحة المتصدرين')
          .setDescription(top.map((m,i) => `${medals[i]||`\`${i+1}\``} <@${m.user_id}> — Lv.\`${m.level}\` · \`${m.xp}\` XP`).join('\n'))
          .setTimestamp()
      ]});
      return true;
    }

    case 'afk': {
      const reason = args.join(' ') || 'لا يوجد سبب';
      const ex = dbGet('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
      if (ex) {
        dbRun('DELETE FROM afk WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
        await message.reply('✅ **تم إلغاء وضع الغياب!**');
      } else {
        dbRun('INSERT OR REPLACE INTO afk (guild_id, user_id, reason) VALUES (?,?,?)', [message.guild.id, message.author.id, reason]);
        try { await message.member.setNickname(`[AFK] ${message.member.displayName}`.slice(0,32)); } catch {}
        await message.reply(`💤 **وضع الغياب مفعّل**\n> السبب: ${reason}`);
      }
      return true;
    }

    case 'decoration': {
      const text = args.join(' ');
      if (!text) { await message.reply('❌ مثال: `زخرف مرحبا`'); return true; }
      if (text.length > 50) { await message.reply('❌ الحد الأقصى 50 حرف'); return true; }
      const styles = [
        ['⭐ نجوم', s => `⭐ ${s} ⭐`],
        ['💎 ألماس', s => `💎 ${s} 💎`],
        ['👑 تاج', s => `👑 ${s} 👑`],
        ['🔥 نار', s => `🔥 ${s} 🔥`],
        ['꧁꧂ إطار', s => `꧁ ${s} ꧂`],
        ['• نقاط', s => [...s].join(' • ')],
        ['﹏ تباعد', s => [...s].join(' ')],
        ['🌸 وردة', s => `🌸 ${s} 🌸`],
        ['⚡ برق', s => `⚡ ${s} ⚡`],
        ['🎯 هدف', s => `[ ${s} ]`],
        ['═══ إطار مزدوج', s => `╔═══════╗\n║ ${s} ║\n╚═══════╝`],
        ['مقلوب', s => [...s].map(c=>({'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᵻ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z'}[c.toLowerCase()]||c)).reverse().join('')],
      ];
      const lines = styles.map(([name, fn]) => { try { return `**${name}** → \`${fn(text)}\``; } catch { return null; } }).filter(Boolean);
      const embed = new EmbedBuilder().setColor('#9b59b6')
        .setTitle(`✨ زخرفة: "${text}"`)
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'اضغط على النص لنسخه • Xtra Bot' });
      await message.reply({ embeds: [embed] });
      return true;
    }

    case 'tax': {
      const amount = parseFloat(args[0]);
      if (!amount || isNaN(amount)) { await message.reply('❌ مثال: `ضريبة 1000 15`'); return true; }
      const rate = parseFloat(args[1]) || 15;
      const taxAmt = amount * rate / 100;
      await message.reply({ embeds: [
        new EmbedBuilder().setColor('#ffd700').setTitle('💰 حاسبة الضريبة')
          .addFields(
            { name: '💵 المبلغ', value: `\`${amount.toLocaleString()}\``, inline: true },
            { name: '📊 النسبة', value: `\`${rate}%\``, inline: true },
            { name: '💸 الضريبة', value: `\`${taxAmt.toLocaleString()}\``, inline: true },
            { name: '💎 الإجمالي', value: `\`\`\`${(amount+taxAmt).toLocaleString()}\`\`\`` }
          )
      ]});
      return true;
    }

    case 'say': {
      if (!isMod) { await message.reply('❌ تحتاج صلاحية إدارة الرسائل'); return true; }
      const text = args.join(' ');
      if (!text) { await message.reply('❌ مثال: `say مرحبا`'); return true; }
      await message.delete().catch(() => {});
      await message.channel.send(text);
      return true;
    }

    case 'shortcut': {
      // Show available shortcuts
      const custom = dbAll('SELECT * FROM shortcuts WHERE guild_id = ?', [message.guild.id]);
      const embed = new EmbedBuilder().setColor('#5865f2')
        .setTitle('⚡ الاختصارات')
        .addFields(
          { name: '📌 اختصارات مخصصة', value: custom.length ? custom.map(s => `\`${s.shortcut}\` → /${s.command_name}`).join('\n') : 'لا يوجد — أضف من الداشبورد' },
          { name: '🔧 بعض الاختصارات المدمجة', value: [
            '`ping` `بنق` `p`',
            '`ban` `حظر` `بان`',
            '`kick` `طرد` `اطرد`',
            '`mute` `كتم` `اكتم`',
            '`purge` `مسح` `clear`',
            '`rank` `رتبة` `xp`',
            '`lb` `متصدرين` `top`',
            '`زخرف` `decoration`',
            '`ضريبة` `tax`',
          ].join('\n') }
        )
        .setFooter({ text: 'لإضافة اختصار مخصص — افتح الداشبورد' });
      await message.reply({ embeds: [embed] });
      return true;
    }

    // ─────────── MODERATION ───────────
    case 'ban': {
      if (!message.member?.permissions.has('BanMembers')) { await message.reply('❌ لا تملك صلاحية الحظر'); return true; }
      if (!mention) { await message.reply('❌ مثال: `ban @user سبب`'); return true; }
      const reason = args.slice(1).join(' ') || 'لا يوجد سبب';
      try {
        await mention.ban({ reason });
        addLog(message.guild.id, 'ban', message.author.id, mention.id, reason);
        await message.reply({ embeds: [new EmbedBuilder().setColor('#ff4444').setTitle('🔨 تم الحظر').addFields({ name: '👤', value: mention.user.tag, inline:true }, { name: '📝', value: reason, inline:true })] });
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'kick': {
      if (!message.member?.permissions.has('KickMembers')) { await message.reply('❌ لا تملك صلاحية الطرد'); return true; }
      if (!mention) { await message.reply('❌ مثال: `kick @user سبب`'); return true; }
      const reason = args.slice(1).join(' ') || 'لا يوجد سبب';
      try {
        await mention.kick(reason);
        addLog(message.guild.id, 'kick', message.author.id, mention.id, reason);
        await message.reply(`✅ تم طرد **${mention.user.tag}**`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'mute': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      if (!mention) { await message.reply('❌ مثال: `مute @user 10` (بالدقائق)'); return true; }
      const mins = parseInt(args[1]) || 10;
      try {
        await mention.timeout(mins * 60000, `by ${message.author.tag}`);
        addLog(message.guild.id, 'mute', message.author.id, mention.id, `${mins}m`);
        await message.reply(`🔇 تم كتم **${mention.user.tag}** لمدة \`${mins}\` دقيقة`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'unmute': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      if (!mention) { await message.reply('❌ مثال: `unmute @user`'); return true; }
      try {
        await mention.timeout(null);
        await message.reply(`🔊 تم رفع الكتم عن **${mention.user.tag}**`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'warn': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      if (!mention) { await message.reply('❌ مثال: `warn @user سبب`'); return true; }
      const reason = args.slice(1).join(' ') || 'لا يوجد سبب';
      dbRun('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?,?,?,?)',
        [message.guild.id, mention.id, message.author.id, reason]);
      const count = dbAll('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?', [message.guild.id, mention.id]).length;
      await message.reply(`⚠️ تم تحذير **${mention.user.tag}**\n> السبب: ${reason} | إجمالي التحذيرات: \`${count}\``);
      return true;
    }

    case 'warnings': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      const target = mention || message.member;
      const warns = dbAll('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY id DESC', [message.guild.id, target.id]);
      if (!warns.length) { await message.reply(`✅ **${target.user?.tag || target.user.tag}** ليس لديه تحذيرات`); return true; }
      const embed = new EmbedBuilder().setColor('#ffd700')
        .setTitle(`⚠️ تحذيرات ${target.user?.tag}`)
        .setDescription(warns.map((w,i) => `**${i+1}.** ${w.reason} — <t:${Math.floor(new Date(w.created_at).getTime()/1000)}:R>`).join('\n'));
      await message.reply({ embeds: [embed] });
      return true;
    }

    case 'clearwarnings': {
      if (!isAdmin) { await message.reply('❌ تحتاج صلاحية أدمن'); return true; }
      if (!mention) { await message.reply('❌ مثال: `clearwarnings @user`'); return true; }
      dbRun('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?', [message.guild.id, mention.id]);
      await message.reply(`✅ تم مسح جميع تحذيرات **${mention.user.tag}**`);
      return true;
    }

    case 'purge': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      const n = Math.min(parseInt(args[0]) || 10, 100);
      try {
        const deleted = await message.channel.bulkDelete(n + 1, true);
        const m = await message.channel.send(`🗑️ تم حذف \`${deleted.size - 1}\` رسالة`);
        setTimeout(() => m.delete().catch(()=>{}), 3000);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'lock': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
      await message.reply('🔒 تم قفل القناة');
      return true;
    }

    case 'unlock': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
      await message.reply('🔓 تم فتح القناة');
      return true;
    }

    case 'slowmode': {
      if (!isMod) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      const secs = parseInt(args[0]) || 0;
      await message.channel.setRateLimitPerUser(secs).catch(()=>{});
      await message.reply(secs ? `🐢 الوضع البطيء: \`${secs}\` ثانية` : '✅ تم إيقاف الوضع البطيء');
      return true;
    }

    case 'rename': {
      if (!message.member?.permissions.has('ManageNicknames')) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      if (!mention) { await message.reply('❌ مثال: `rename @user الاسم الجديد`'); return true; }
      const newName = args.slice(1).join(' ') || null;
      try {
        await mention.setNickname(newName);
        addLog(message.guild.id, 'rename', message.author.id, mention.id, `→ ${newName||'إزالة'}`);
        await message.reply(`✅ تم تغيير اسم **${mention.user.tag}** إلى: ${newName || '(إزالة)'}`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'come': {
      if (!message.member?.permissions.has('MoveMembers')) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      if (!mention) { await message.reply('❌ مثال: `come @user`'); return true; }
      const voiceCh = message.member?.voice?.channel;
      if (!voiceCh) { await message.reply('❌ انضم لقناة صوتية أولاً'); return true; }
      if (!mention.voice?.channel) { await message.reply('❌ العضو مش في قناة صوتية'); return true; }
      try {
        await mention.voice.setChannel(voiceCh);
        await message.reply(`📢 تم استدعاء **${mention.user.tag}** إلى **${voiceCh.name}**`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'unban': {
      if (!message.member?.permissions.has('BanMembers')) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      const userId = args[0];
      if (!userId) { await message.reply('❌ مثال: `unban USER_ID`'); return true; }
      try {
        await message.guild.members.unban(userId);
        await message.reply(`✅ تم رفع الحظر عن \`${userId}\``);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'addrole': {
      if (!message.member?.permissions.has('ManageRoles')) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      const target = mention;
      const roleMention = message.mentions.roles?.first();
      if (!target || !roleMention) { await message.reply('❌ مثال: `addrole @user @رتبة`'); return true; }
      try {
        await target.roles.add(roleMention);
        await message.reply(`✅ تمت إضافة ${roleMention} لـ **${target.user.tag}**`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    case 'removerole': {
      if (!message.member?.permissions.has('ManageRoles')) { await message.reply('❌ لا تملك الصلاحية'); return true; }
      const target = mention;
      const roleMention = message.mentions.roles?.first();
      if (!target || !roleMention) { await message.reply('❌ مثال: `removerole @user @رتبة`'); return true; }
      try {
        await target.roles.remove(roleMention);
        await message.reply(`✅ تمت إزالة ${roleMention} من **${target.user.tag}**`);
      } catch(e) { await message.reply(`❌ ${e.message}`); }
      return true;
    }

    default:
      return false;
  }
}

// ══════════════════════════════════════════
//  PASSTHROUGH — Auto-respond, AFK, XP, Protection
// ══════════════════════════════════════════
async function handlePassthrough(message, client, guild) {
  const lower = message.content.toLowerCase();

  // Auto Respond
  if (guild) {
    const responds = dbAll('SELECT * FROM autorespond WHERE guild_id = ? AND enabled = 1', [message.guild.id]);
    for (const r of responds) {
      let hit = false;
      const t = r.trigger.toLowerCase();
      if (r.match_type === 'exact') hit = lower === t;
      else if (r.match_type === 'contains') hit = lower.includes(t);
      else if (r.match_type === 'startswith') hit = lower.startsWith(t);
      else if (r.match_type === 'endswith') hit = lower.endsWith(t);
      if (hit) { await message.reply(r.response).catch(() => {}); break; }
    }
  }

  // AFK return
  const afk = dbGet('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
  if (afk) {
    dbRun('DELETE FROM afk WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
    await message.reply({ content: `👋 مرحباً بعودتك!`, allowedMentions: { repliedUser: false } }).catch(() => {});
    const nick = message.member?.nickname;
    if (nick?.startsWith('[AFK]')) await message.member?.setNickname(nick.replace('[AFK] ', '')).catch(() => {});
  }

  // Mention AFK check
  for (const [, user] of message.mentions.users) {
    if (user.bot) continue;
    const mAfk = dbGet('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?', [message.guild.id, user.id]);
    if (mAfk) {
      const ago = Math.floor((Date.now() - new Date(mAfk.started_at).getTime()) / 60000);
      await message.reply({ content: `💤 **${user.username}** غائب منذ \`${ago}\` دقيقة${mAfk.reason ? ` — ${mAfk.reason}` : ''}`, allowedMentions: { repliedUser: false } }).catch(() => {});
    }
  }

  // Protection
  await handleProtection(message, guild);

  // XP
  if (guild) await handleXP(message, guild);
}

async function handleProtection(message, guild) {
  if (!guild || guild.protection_enabled === 0) return;
  const isOwner = message.author.id === message.guild.ownerId;
  if (isOwner) return;
  const wl = dbGet('SELECT * FROM protection_whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
  const bypass = wl?.bypass_all;

  if (guild.anti_spam && !bypass && !wl?.bypass_spam) {
    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    if (!spamMap.has(key)) spamMap.set(key, []);
    const times = spamMap.get(key).filter(t => now - t < 5000);
    times.push(now); spamMap.set(key, times);
    if (times.length >= 5) {
      await message.delete().catch(() => {});
      await message.member?.timeout(30000, 'Anti-Spam').catch(() => {});
      spamMap.delete(key); return;
    }
  }
  if (guild.anti_links && !bypass && !wl?.bypass_links) {
    if (/(https?:\/\/|www\.)\S+/gi.test(message.content) && !message.member?.permissions.has('Administrator')) {
      await message.delete().catch(() => {});
      const w = await message.channel.send(`<@${message.author.id}> 🔗 الروابط غير مسموح بها!`);
      setTimeout(() => w.delete().catch(()=>{}), 4000); return;
    }
  }
  if (guild.anti_caps && !bypass && !wl?.bypass_caps && message.content.length > 10) {
    const letters = message.content.replace(/[^A-Za-z]/g, '');
    if (letters.length > 0 && letters.split('').filter(c => c === c.toUpperCase()).length / letters.length > 0.8) {
      await message.delete().catch(() => {}); return;
    }
  }
  if (guild.anti_mention && !bypass && !wl?.bypass_mentions && message.mentions.users.size >= 5) {
    await message.delete().catch(() => {});
    await message.member?.timeout(60000, 'Anti-Mass-Mention').catch(() => {}); return;
  }
}

async function handleXP(message, guild) {
  const xp = Math.floor(Math.random() * 10) + 5;
  const ex = dbGet('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?', [message.guild.id, message.author.id]);
  if (!ex) {
    dbRun('INSERT INTO levels (guild_id, user_id, xp, level, messages) VALUES (?,?,?,0,1)', [message.guild.id, message.author.id, xp]);
  } else {
    const newXp = ex.xp + xp;
    const newLevel = Math.floor(Math.sqrt(newXp / 50));
    dbRun('UPDATE levels SET xp=?, level=?, messages=messages+1 WHERE guild_id=? AND user_id=?', [newXp, newLevel, message.guild.id, message.author.id]);
    if (newLevel > ex.level) {
      const lr = dbGet('SELECT * FROM level_roles WHERE guild_id = ? AND level = ?', [message.guild.id, newLevel]);
      if (lr) { const role = message.guild.roles.cache.get(lr.role_id); if (role) await message.member?.roles.add(role).catch(()=>{}); }
      if (guild.level_channel) {
        const ch = message.guild.channels.cache.get(guild.level_channel);
        const msg = (guild.level_msg || '🎉 {user} وصل للمستوى **{level}**! 🏆')
          .replace(/{user}/g, message.author.toString()).replace(/{level}/g, newLevel).replace(/{username}/g, message.author.username);
        if (ch) await ch.send(msg).catch(() => {});
      }
      if (guild.level_dm) await message.author.send(`🎉 وصلت للمستوى **${newLevel}** في **${message.guild.name}**!`).catch(() => {});
    }
  }
}
