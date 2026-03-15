const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { updateGuild, ensureGuild } = require('../../database');
const AZKAR = ['سبحان الله وبحمده سبحان الله العظيم','لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير','اللهم صل وسلم على نبينا محمد','أستغفر الله وأتوب إليه','لا حول ولا قوة إلا بالله العلي العظيم','سبحان الله والحمد لله ولا إله إلا الله والله أكبر','حسبنا الله ونعم الوكيل','اللهم إني أسألك العافية في الدنيا والآخرة','اللهم اغفر لي وارحمني وعافني وارزقني','بسم الله الرحمن الرحيم'];
module.exports = {
  data: new SlashCommandBuilder().setName('azkar').setDescription('📿 نظام الأذكار')
    .addSubcommand(s => s.setName('now').setDescription('ذكر عشوائي الآن'))
    .addSubcommand(s => s.setName('setup').setDescription('إعداد الأذكار التلقائية')
      .addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true))
      .addIntegerOption(o => o.setName('interval').setDescription('كل كم دقيقة').setMinValue(10).setMaxValue(1440).setRequired(true)))
    .addSubcommand(s => s.setName('stop').setDescription('إيقاف الأذكار')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'now') return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x10b981).setTitle('📿 ذكر').setDescription(`> **${AZKAR[Math.floor(Math.random()*AZKAR.length)]}**`).setTimestamp()] });
    if (!interaction.member?.permissions.has('Administrator')) return interaction.reply({ content: '❌ تحتاج صلاحية أدمن', ephemeral: true });
    if (sub === 'setup') {
      const ch = interaction.options.getChannel('channel'); const min = interaction.options.getInteger('interval');
      ensureGuild(interaction.guildId); try { updateGuild(interaction.guildId, { azkar_channel: ch.id, azkar_interval: min, azkar_enabled: 1 }); } catch {}
      return interaction.reply({ content: `✅ الأذكار في <#${ch.id}> كل **${min}** دقيقة`, ephemeral: true });
    }
    if (sub === 'stop') { try { updateGuild(interaction.guildId, { azkar_enabled: 0 }); } catch {} return interaction.reply({ content: '✅ تم إيقاف الأذكار', ephemeral: true }); }
  }
};
