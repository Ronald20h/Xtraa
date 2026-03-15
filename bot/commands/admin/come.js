const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits
} = require('discord.js');
const { addLog } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('come')
    .setDescription('📣 نداء عضو — يرسل له رسالة خاصة يناديه فيها')
    .addUserOption(o =>
      o.setName('user').setDescription('العضو المراد ناداءه').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('message').setDescription('رسالة إضافية (اختياري)').setRequired(false).setMaxLength(200)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const extra  = interaction.options.getString('message') || '';

    if (!target) return interaction.editReply({ content: '❌ العضو غير موجود' });
    if (target.id === interaction.user.id) return interaction.editReply({ content: '❌ ما تقدر تنادي نفسك 😄' });

    // رسالة النداء الخاصة
    const embed = new EmbedBuilder()
      .setColor(0x7c3aed)
      .setTitle('📣 لديك نداء!')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setDescription(`تم استدعاؤك في **${interaction.guild.name}**`)
      .addFields(
        { name: '👤 بواسطة', value: `${interaction.member}`, inline: true },
        { name: '📢 القناة',  value: `${interaction.channel}`, inline: true },
      )
      .setTimestamp();

    if (extra) embed.addFields({ name: '💬 الرسالة', value: extra });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🔗 الذهاب للقناة')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`)
    );

    try {
      await target.send({ embeds: [embed], components: [row] });

      // رسالة عامة في الشات تختفي بعد 6 ثواني
      const pub = await interaction.channel.send({
        embeds: [new EmbedBuilder().setColor(0x7c3aed)
          .setDescription(`📣 ${interaction.member} نادى ${target}`)
          .setTimestamp()]
      });
      setTimeout(() => pub.delete().catch(() => {}), 6000);

      await interaction.editReply({ content: `✅ تم إرسال النداء لـ ${target}` });
      addLog(interaction.guildId, 'come', interaction.user.id, target.id, 'نداء');
    } catch {
      await interaction.editReply({
        content: `❌ لا يمكن إرسال رسالة خاصة لـ **${target.user.username}**\n> ربما أغلق الرسائل الخاصة`
      });
    }
  }
};
