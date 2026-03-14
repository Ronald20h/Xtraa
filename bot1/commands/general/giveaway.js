const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { dbRun, dbGet, dbAll } = require('../../database');

function parseTime(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const [, num, unit] = match;
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return parseInt(num) * mult[unit];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('نظام الهبة / Giveaway system')
    .addSubcommand(s => s.setName('start').setDescription('بدء هبة جديدة')
      .addStringOption(o => o.setName('prize').setDescription('الجائزة').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('المدة (مثال: 1h, 30m, 1d)').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('عدد الفائزين').setMinValue(1).setMaxValue(10))
      .addChannelOption(o => o.setName('channel').setDescription('القناة')))
    .addSubcommand(s => s.setName('end').setDescription('إنهاء هبة').addStringOption(o => o.setName('id').setDescription('ID الهبة').setRequired(true)))
    .addSubcommand(s => s.setName('reroll').setDescription('إعادة السحب').addStringOption(o => o.setName('id').setDescription('ID الهبة').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('قائمة الهبات'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const dur = interaction.options.getString('duration');
      const winners = interaction.options.getInteger('winners') || 1;
      const ch = interaction.options.getChannel('channel') || interaction.channel;
      const ms = parseTime(dur);
      if (!ms) return interaction.reply({ content: '❌ مدة غير صحيحة! استخدم مثلاً: 1h, 30m, 1d', ephemeral: true });

      const endsAt = new Date(Date.now() + ms).toISOString();
      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle(`🎉 هبة! — ${prize}`)
        .setDescription([
          `**🎁 الجائزة:** ${prize}`,
          `**👑 الفائزون:** ${winners} شخص`,
          `**⏰ تنتهي:** <t:${Math.floor((Date.now() + ms) / 1000)}:R>`,
          `**🎫 للمشاركة:** اضغط 🎉`,
          `**👤 بواسطة:** ${interaction.user}`
        ].join('\n'))
        .setFooter({ text: `${winners} فائز • تنتهي` })
        .setTimestamp(new Date(Date.now() + ms));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 المشاركة').setStyle(ButtonStyle.Primary)
      );
      const msg = await ch.send({ embeds: [embed], components: [row] });
      dbRun('INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winner_count, host_id, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [interaction.guildId, ch.id, msg.id, prize, winners, interaction.user.id, endsAt]);
      const ga = dbGet('SELECT * FROM giveaways WHERE message_id = ?', [msg.id]);
      await interaction.reply({ content: `✅ تم إنشاء الهبة! [انتقل إليها](${msg.url}) — ID: \`${ga.id}\``, ephemeral: true });

      // Auto-end
      setTimeout(async () => {
        try { await endGiveaway(ga.id, interaction.client); } catch {}
      }, ms);

    } else if (sub === 'end') {
      const id = parseInt(interaction.options.getString('id'));
      await endGiveaway(id, interaction.client);
      await interaction.reply({ content: '✅ تم إنهاء الهبة!', ephemeral: true });

    } else if (sub === 'reroll') {
      const id = parseInt(interaction.options.getString('id'));
      const ga = dbGet('SELECT * FROM giveaways WHERE id = ?', [id]);
      if (!ga) return interaction.reply({ content: '❌ هبة غير موجودة', ephemeral: true });
      const entries = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id = ?', [id]);
      if (!entries.length) return interaction.reply({ content: '❌ لا توجد مشاركين', ephemeral: true });
      const winner = entries[Math.floor(Math.random() * entries.length)];
      const ch = await interaction.client.channels.fetch(ga.channel_id).catch(() => null);
      if (ch) await ch.send(`🎊 إعادة سحب الهبة **${ga.prize}** — الفائز الجديد: <@${winner.user_id}>!`);
      await interaction.reply({ content: `✅ الفائز الجديد: <@${winner.user_id}>`, ephemeral: true });

    } else if (sub === 'list') {
      const list = dbAll('SELECT * FROM giveaways WHERE guild_id = ? AND status = "active" ORDER BY id DESC LIMIT 10', [interaction.guildId]);
      if (!list.length) return interaction.reply({ content: '📭 لا توجد هبات نشطة', ephemeral: true });
      const embed = new EmbedBuilder().setColor('#ffd700').setTitle('🎉 الهبات النشطة')
        .setDescription(list.map(g => `**ID ${g.id}** — ${g.prize} | تنتهي <t:${Math.floor(new Date(g.ends_at).getTime()/1000)}:R>`).join('\n'));
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};

async function endGiveaway(id, client) {
  const ga = dbGet('SELECT * FROM giveaways WHERE id = ?', [id]);
  if (!ga || ga.status !== 'active') return;
  const entries = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id = ?', [id]);
  dbRun('UPDATE giveaways SET status = "ended" WHERE id = ?', [id]);
  const ch = await client.channels.fetch(ga.channel_id).catch(() => null);
  if (!ch) return;
  if (!entries.length) { await ch.send(`❌ انتهت الهبة **${ga.prize}** بدون فائزين!`); return; }
  const winners = [];
  const pool = [...entries];
  for (let i = 0; i < Math.min(ga.winner_count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }
  const winMentions = winners.map(w => `<@${w.user_id}>`).join(', ');
  dbRun('UPDATE giveaways SET winners = ? WHERE id = ?', [JSON.stringify(winners.map(w => w.user_id)), id]);
  const embed = new EmbedBuilder().setColor('#00ff88').setTitle(`🎊 انتهت الهبة — ${ga.prize}`)
    .setDescription(`**🏆 الفائزون:** ${winMentions}\n**🎁 الجائزة:** ${ga.prize}\n**👤 بواسطة:** <@${ga.host_id}>`)
    .setTimestamp();
  try {
    const msg = await ch.messages.fetch(ga.message_id);
    await msg.edit({ embeds: [embed], components: [] });
  } catch {}
  await ch.send({ content: `🎊 تهانينا ${winMentions}! فزتم بـ **${ga.prize}**!` });
}
