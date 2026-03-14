const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbRun, dbGet } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('تفعيل/إلغاء وضع الغياب')
    .addStringOption(o => o.setName('reason').setDescription('سبب الغياب').setRequired(false)),
  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب';
    const existing = dbGet('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?', [interaction.guildId, interaction.user.id]);
    if (existing) {
      dbRun('DELETE FROM afk WHERE guild_id = ? AND user_id = ?', [interaction.guildId, interaction.user.id]);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff88').setDescription(`✅ تم إلغاء وضع الغياب!`)] });
    } else {
      dbRun('INSERT OR REPLACE INTO afk (guild_id, user_id, reason) VALUES (?, ?, ?)', [interaction.guildId, interaction.user.id, reason]);
      try { await interaction.member.setNickname(`[AFK] ${interaction.member.displayName}`.slice(0,32)); } catch {}
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffd700').setTitle('💤 وضع الغياب').setDescription(`✅ تم تفعيل وضع الغياب!\n📝 **السبب:** ${reason}`)] });
    }
  }
};
