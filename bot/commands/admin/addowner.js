const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

function getOwners() {
  return (process.env.OWNER_IDS || process.env.OWNER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
}

const runtimeOwners = new Set(getOwners());

module.exports = {
  data: new SlashCommandBuilder().setName('addowner').setDescription('👑 إدارة أونرز البوت')
    .addSubcommand(s => s.setName('add').setDescription('إضافة أونر جديد').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('إزالة أونر').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('قائمة الأونرز')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!runtimeOwners.has(interaction.user.id))
      return interaction.editReply({ content: '❌ هذا الأمر لأونر البوت الرئيسي فقط!' });

    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const list = [];
      for (const id of runtimeOwners) {
        try { const u = await interaction.client.users.fetch(id); list.push(`👑 **${u.username}** — \`${id}\``); }
        catch { list.push(`👑 \`${id}\` — (غير معروف)`); }
      }
      return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xf59e0b)
        .setTitle('👑 قائمة الأونرز').setDescription(list.join('\n') || 'لا يوجد').setTimestamp()] });
    }

    const target = interaction.options.getUser('user');

    if (sub === 'add') {
      if (runtimeOwners.has(target.id)) return interaction.editReply({ content: `❌ **${target.username}** أونر بالفعل!` });
      runtimeOwners.add(target.id);
      return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x10b981).setTitle('✅ تم إضافة أونر')
        .setDescription(`تم إضافة **${target.username}** كأونر!`)
        .addFields({name:'👤',value:`${target}`,inline:true},{name:'🔢 الإجمالي',value:`${runtimeOwners.size} أونر`,inline:true})
        .setThumbnail(target.displayAvatarURL({ dynamic: true })).setTimestamp()] });
    }

    if (sub === 'remove') {
      if (!runtimeOwners.has(target.id)) return interaction.editReply({ content: `❌ **${target.username}** ليس أونر!` });
      if (runtimeOwners.size === 1) return interaction.editReply({ content: '❌ لا يمكن إزالة الأونر الوحيد!' });
      runtimeOwners.delete(target.id);
      return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xef4444).setTitle('✅ تم إزالة الأونر')
        .setDescription(`تم إزالة **${target.username}**`)
        .addFields({name:'🔢 الإجمالي الآن',value:`${runtimeOwners.size} أونر`,inline:true}).setTimestamp()] });
    }
  }
};
