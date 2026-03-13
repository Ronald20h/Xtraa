const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbGet, updateGuild, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('protection').setDescription('إعدادات الحماية / Protection settings')
    .addSubcommand(s => s.setName('status').setDescription('حالة الحماية'))
    .addSubcommand(s => s.setName('antispam').setDescription('مضاد السبام').addBooleanOption(o => o.setName('enable').setDescription('تفعيل').setRequired(true)))
    .addSubcommand(s => s.setName('antilinks').setDescription('مضاد الروابط').addBooleanOption(o => o.setName('enable').setDescription('تفعيل').setRequired(true)))
    .addSubcommand(s => s.setName('anticaps').setDescription('مضاد الكابس').addBooleanOption(o => o.setName('enable').setDescription('تفعيل').setRequired(true)))
    .addSubcommand(s => s.setName('antimention').setDescription('مضاد المنشن').addBooleanOption(o => o.setName('enable').setDescription('تفعيل').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = await ensureGuild(interaction.guildId);
    if (sub === 'status') {
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🛡️ حالة الحماية')
        .addFields(
          { name: '🚫 مضاد السبام', value: guild.anti_spam ? '✅ مفعل' : '❌ معطل', inline: true },
          { name: '🔗 مضاد الروابط', value: guild.anti_links ? '✅ مفعل' : '❌ معطل', inline: true },
          { name: '🔡 مضاد الكابس', value: guild.anti_caps ? '✅ مفعل' : '❌ معطل', inline: true },
          { name: '📢 مضاد المنشن', value: guild.anti_mention ? '✅ مفعل' : '❌ معطل', inline: true },
        );
      return interaction.reply({ embeds: [embed] });
    }
    const enable = interaction.options.getBoolean('enable') ? 1 : 0;
    const map = { antispam:'anti_spam', antilinks:'anti_links', anticaps:'anti_caps', antimention:'anti_mention' };
    await updateGuild(interaction.guildId, { [map[sub]]: enable });
    await interaction.reply({ content: `✅ تم ${enable?'تفعيل':'تعطيل'} **${sub}**`, ephemeral: true });
  }
};
