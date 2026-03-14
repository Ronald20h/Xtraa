const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { dbRun, dbAll, dbGet, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('embed').setDescription('إنشاء وإدارة الإيمبيد / Manage embeds')
    .addSubcommand(s => s.setName('create').setDescription('إنشاء إيمبيد'))
    .addSubcommand(s => s.setName('send').setDescription('إرسال إيمبيد').addStringOption(o => o.setName('name').setDescription('الاسم').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(false)))
    .addSubcommand(s => s.setName('list').setDescription('القائمة'))
    .addSubcommand(s => s.setName('delete').setDescription('حذف').addStringOption(o => o.setName('name').setDescription('الاسم').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await ensureGuild(interaction.guildId);
    if (sub === 'create') {
      const modal = new ModalBuilder().setCustomId('embed_create').setTitle('إنشاء إيمبيد جديد');
      modal.addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('embed_name').setLabel('اسم الإيمبيد').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('embed_title').setLabel('العنوان').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('embed_desc').setLabel('الوصف').setStyle(TextInputStyle.Paragraph).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('embed_color').setLabel('اللون (hex)').setStyle(TextInputStyle.Short).setValue('#5865F2').setRequired(false)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('embed_footer').setLabel('الفوتر').setStyle(TextInputStyle.Short).setRequired(false)),
      );
      await interaction.showModal(modal);
    } else if (sub === 'send') {
      const name = interaction.options.getString('name');
      const ch = interaction.options.getChannel('channel') || interaction.channel;
      const emb = await dbGet('SELECT * FROM embeds WHERE guild_id = ? AND name = ?', [interaction.guildId, name]);
      if (!emb) return interaction.reply({ content: `❌ لا يوجد إيمبيد باسم **${name}**`, ephemeral: true });
      const e = new EmbedBuilder().setColor(emb.color).setTitle(emb.title).setDescription(emb.description);
      if (emb.footer) e.setFooter({ text: emb.footer });
      await ch.send({ embeds: [e] });
      await interaction.reply({ content: `✅ تم الإرسال إلى <#${ch.id}>`, ephemeral: true });
    } else if (sub === 'list') {
      const list = await dbAll('SELECT * FROM embeds WHERE guild_id = ?', [interaction.guildId]);
      if (!list.length) return interaction.reply({ content: '❌ لا توجد إيمبيدات.', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('📋 الإيمبيدات').setDescription(list.map(e => `• **${e.name}** — ${e.title}`).join('\n'))], ephemeral: true });
    } else {
      const name = interaction.options.getString('name');
      const res = await dbRun('DELETE FROM embeds WHERE guild_id = ? AND name = ?', [interaction.guildId, name]);
      await interaction.reply({ content: res.changes ? `✅ تم حذف **${name}**` : `❌ لم أجده`, ephemeral: true });
    }
  }
};
