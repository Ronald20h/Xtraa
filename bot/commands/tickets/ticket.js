const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { dbRun, dbGet, dbAll, ensureGuild, updateGuild } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('ticket').setDescription('نظام التذاكر / Ticket system')
    .addSubcommand(s => s.setName('setup').setDescription('إعداد التذاكر')
      .addChannelOption(o => o.setName('category').setDescription('الفئة'))
      .addIntegerOption(o => o.setName('max').setDescription('الحد الأقصى').setMinValue(1).setMaxValue(10)))
    .addSubcommand(s => s.setName('panel').setDescription('إرسال لوحة التذاكر')
      .addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true))
      .addStringOption(o => o.setName('title').setDescription('عنوان اللوحة'))
      .addStringOption(o => o.setName('description').setDescription('وصف اللوحة')))
    .addSubcommand(s => s.setName('close').setDescription('إغلاق التذكرة'))
    .addSubcommand(s => s.setName('claim').setDescription('استلام التذكرة'))
    .addSubcommand(s => s.setName('add').setDescription('إضافة عضو').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('إزالة عضو').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    ensureGuild(interaction.guildId);

    if (sub === 'setup') {
      const cat = interaction.options.getChannel('category');
      const max = interaction.options.getInteger('max') || 5;
      updateGuild(interaction.guildId, { ticket_category: cat?.id || null, max_tickets: max });
      await interaction.reply({ content: `✅ تم إعداد التذاكر — الحد: ${max} تذاكر${cat?`, الفئة: ${cat.name}`:''}`, ephemeral: true });

    } else if (sub === 'panel') {
      const ch = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title') || '🎫 نظام التذاكر';
      const desc = interaction.options.getString('description') || 'اضغط على الزر أدناه لفتح تذكرة دعم';
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle(title).setDescription(desc)
        .setFooter({text:`${interaction.guild.name} • نظام التذاكر`});
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_open').setLabel('🎫 فتح تذكرة').setStyle(ButtonStyle.Primary)
      );
      await ch.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ تم إرسال لوحة التذاكر في <#${ch.id}>`, ephemeral: true });

    } else if (sub === 'close') {
      const ticket = dbGet('SELECT * FROM tickets WHERE channel_id = ? AND status = "open"', [interaction.channelId]);
      if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة مفتوحة', ephemeral: true });
      dbRun('UPDATE tickets SET status = "closed", closed_at = CURRENT_TIMESTAMP WHERE channel_id = ?', [interaction.channelId]);
      await interaction.reply({ content: '🔒 سيتم إغلاق التذكرة خلال 5 ثواني...' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);

    } else if (sub === 'claim') {
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true, ViewChannel: true });
      await interaction.reply({ content: `✅ ${interaction.user} استلم هذه التذكرة` });

    } else if (sub === 'add') {
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
      await interaction.reply({ content: `✅ تم إضافة ${user} للتذكرة` });

    } else if (sub === 'remove') {
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.delete(user.id);
      await interaction.reply({ content: `✅ تم إزالة ${user} من التذكرة` });
    }
  }
};
