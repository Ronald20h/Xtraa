const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, dbGet, dbAll, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('gameimage').setDescription('إدارة صور الألعاب / Game images')
    .addSubcommand(s => s.setName('set').setDescription('تعيين صورة').addStringOption(o => o.setName('game').setDescription('اسم اللعبة').setRequired(true)).addStringOption(o => o.setName('url').setDescription('رابط الصورة').setRequired(true)).setDefaultMemberPermissions ? s : s)
    .addSubcommand(s => s.setName('show').setDescription('عرض صورة').addStringOption(o => o.setName('game').setDescription('اسم اللعبة').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('قائمة الألعاب')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await ensureGuild(interaction.guildId);
    if (sub === 'set') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ لا صلاحية', ephemeral: true });
      const game = interaction.options.getString('game'), url = interaction.options.getString('url');
      await dbRun('INSERT OR REPLACE INTO game_images (guild_id, game_name, image_url, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [interaction.guildId, game, url]);
      await interaction.reply({ content: `✅ تم تعيين صورة **${game}**` });
    } else if (sub === 'show') {
      const game = interaction.options.getString('game');
      const img = await dbGet('SELECT * FROM game_images WHERE guild_id = ? AND game_name = ?', [interaction.guildId, game]);
      if (!img) return interaction.reply({ content: '❌ لا توجد صورة لهذه اللعبة', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle(`🎮 ${game}`).setImage(img.image_url)] });
    } else {
      const games = await dbAll('SELECT * FROM game_images WHERE guild_id = ?', [interaction.guildId]);
      if (!games.length) return interaction.reply({ content: '❌ لا توجد ألعاب.', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🎮 قائمة الألعاب').setDescription(games.map(g => `• **${g.game_name}**`).join('\n'))] });
    }
  }
};
