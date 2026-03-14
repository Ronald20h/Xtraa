const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('createrole').setDescription('➕ إنشاء رتبة جديدة')
    .addStringOption(o => o.setName('name').setDescription('اسم الرتبة').setRequired(true))
    .addStringOption(o => o.setName('color').setDescription('اللون HEX'))
    .addBooleanOption(o => o.setName('hoist').setDescription('عرض في القائمة منفصلاً'))
    .addBooleanOption(o => o.setName('mentionable').setDescription('قابلة للمنشن'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color') || '#99AAB5';
    const hoist = interaction.options.getBoolean('hoist') ?? false;
    const mentionable = interaction.options.getBoolean('mentionable') ?? false;
    try {
      const role = await interaction.guild.roles.create({ name, color, hoist, mentionable });
      await interaction.reply(`✅ تم إنشاء الرتبة ${role} بنجاح!`);
    } catch(e) { await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true }); }
  }
};
