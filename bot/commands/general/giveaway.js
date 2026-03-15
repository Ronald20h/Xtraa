const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { dbGet, dbAll, dbRun, addLog } = require('../../database');
// دالة بسيطة بدل مكتبة ms
function parseTime(str) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (match) return parseInt(match[1]) * units[match[2].toLowerCase()];
  return parseInt(str) * 60000; // افتراضي دقائق
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 نظام الهبات')
    .addSubcommand(s => s.setName('start').setDescription('بدء هبة جديدة')
      .addStringOption(o => o.setName('prize').setDescription('الجائزة').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('المدة (مثال: 1h, 30m, 1d)').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('عدد الفائزين').setMinValue(1).setMaxValue(20))
      .addChannelOption(o => o.setName('channel').setDescription('القناة')))
    .addSubcommand(s => s.setName('end').setDescription('إنهاء هبة')
      .addStringOption(o => o.setName('message_id').setDescription('ID رسالة الهبة').setRequired(true)))
    .addSubcommand(s => s.setName('reroll').setDescription('إعادة السحب')
      .addStringOption(o => o.setName('message_id').setDescription('ID رسالة الهبة').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      if (!interaction.member?.permissions.has('ManageGuild'))
        return interaction.reply({ content: '❌ تحتاج صلاحية إدارة السيرفر', ephemeral: true });
      const prize    = interaction.options.getString('prize');
      const durStr   = interaction.options.getString('duration');
      const winners  = interaction.options.getInteger('winners') || 1;
      const ch       = interaction.options.getChannel('channel') || interaction.channel;
      let duration;
      try { duration = parseTime(durStr); } catch { duration = null; }
      if (!duration) return interaction.reply({ content: '❌ مدة خاطئة. مثال: `1h` `30m` `1d`', ephemeral: true });
      const endsAt = new Date(Date.now() + duration);
      const embed = new EmbedBuilder().setColor(0xf59e0b)
        .setTitle(`🎉 ${prize}`)
        .setDescription([
          `> اضغط على 🎉 للمشاركة!`,
          ``,
          `**🏆 الفائزون:** ${winners}`,
          `**⏰ ينتهي:** <t:${Math.floor(endsAt.getTime()/1000)}:R>`,
          `**📣 بواسطة:** ${interaction.user}`,
        ].join('\n'))
        .setTimestamp(endsAt)
        .setFooter({ text: `${winners} فائز • ينتهي` });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 شارك').setStyle(ButtonStyle.Success)
      );
      const msg = await ch.send({ embeds: [embed], components: [row] });
      dbRun('INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winner_count, host_id, ends_at) VALUES (?,?,?,?,?,?,?)',
        [interaction.guildId, ch.id, msg.id, prize, winners, interaction.user.id, endsAt.toISOString()]);
      await interaction.reply({ content: `✅ تم بدء الهبة في <#${ch.id}>`, ephemeral: true });

      // مؤقت للانتهاء
      setTimeout(async () => {
        try {
          const ga = dbGet('SELECT * FROM giveaways WHERE message_id = ? AND status = "active"', [msg.id]);
          if (!ga) return;
          const entries = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id = ?', [ga.id]);
          const winnerList = [];
          const pool = [...entries];
          for (let i = 0; i < Math.min(winners, pool.length); i++) {
            const idx = Math.floor(Math.random() * pool.length);
            winnerList.push(pool.splice(idx, 1)[0]);
          }
          dbRun('UPDATE giveaways SET status = "ended", winners = ? WHERE id = ?',
            [JSON.stringify(winnerList.map(w => w.user_id)), ga.id]);
          const winText = winnerList.length ? winnerList.map(w => `<@${w.user_id}>`).join(', ') : 'لا أحد شارك 😢';
          await msg.edit({ embeds: [embed.setColor(0xef4444).setTitle(`🎊 ${prize} — انتهت!`)
            .setDescription(`**الفائزون:** ${winText}\n**المشاركون:** ${entries.length}`)
            .setFooter({ text: 'انتهت الهبة' })], components: [] });
          await ch.send({ content: `🎊 تهانينا! الفائزون في **${prize}**: ${winText}` });
        } catch {}
      }, duration);
    }

    if (sub === 'end') {
      const msgId = interaction.options.getString('message_id');
      const ga = dbGet('SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ?', [msgId, interaction.guildId]);
      if (!ga) return interaction.reply({ content: '❌ لم يتم إيجاد الهبة', ephemeral: true });
      const entries = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id = ?', [ga.id]);
      if (!entries.length) return interaction.reply({ content: '❌ لا توجد مشاركات', ephemeral: true });
      const idx = Math.floor(Math.random() * entries.length);
      const winner = entries[idx];
      dbRun('UPDATE giveaways SET status = "ended", winners = ? WHERE id = ?', [JSON.stringify([winner.user_id]), ga.id]);
      return interaction.reply({ content: `🎊 الفائز في **${ga.prize}**: <@${winner.user_id}>` });
    }

    if (sub === 'reroll') {
      const msgId = interaction.options.getString('message_id');
      const ga = dbGet('SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ?', [msgId, interaction.guildId]);
      if (!ga) return interaction.reply({ content: '❌ لم يتم إيجاد الهبة', ephemeral: true });
      const entries = dbAll('SELECT * FROM giveaway_entries WHERE giveaway_id = ?', [ga.id]);
      if (!entries.length) return interaction.reply({ content: '❌ لا توجد مشاركات', ephemeral: true });
      const winner = entries[Math.floor(Math.random() * entries.length)];
      return interaction.reply({ content: `🔄 الفائز الجديد في **${ga.prize}**: <@${winner.user_id}>` });
    }
  }
};
