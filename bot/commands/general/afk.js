const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbGet, dbRun } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('afk').setDescription('😴 تفعيل/إلغاء وضع الغياب')
    .addStringOption(o => o.setName('reason').setDescription('سبب الغياب').setRequired(false)),
  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'غائب';
    const ex = dbGet('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?', [interaction.guildId, interaction.user.id]);
    if (ex) {
      dbRun('DELETE FROM afk WHERE guild_id = ? AND user_id = ?', [interaction.guildId, interaction.user.id]);
      try { const n = interaction.member?.nickname; if (n?.startsWith('[AFK]')) await interaction.member.setNickname(n.replace('[AFK] ','')); } catch {}
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x10b981).setDescription('👋 **مرحباً بعودتك!** تم إلغاء وضع الغياب').setTimestamp()], ephemeral: true });
    }
    dbRun('INSERT OR REPLACE INTO afk (guild_id, user_id, reason) VALUES (?,?,?)', [interaction.guildId, interaction.user.id, reason]);
    try { await interaction.member.setNickname(`[AFK] ${interaction.member.displayName}`.slice(0,32)); } catch {}
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffa500)
      .setDescription(`💤 **وضع الغياب مفعّل**\n> السبب: ${reason}`)
      .setFooter({ text: 'سيتم إشعار من يذكرك' }).setTimestamp()
    ]});
  }
};
