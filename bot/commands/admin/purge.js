const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('purge').setDescription('مسح رسائل / Purge messages')
    .addIntegerOption(o => o.setName('amount').setDescription('العدد (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('مسح رسائل مستخدم معين'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');
    await interaction.deferReply({ ephemeral: true });
    let messages = await interaction.channel.messages.fetch({ limit: amount });
    if (user) messages = messages.filter(m => m.author.id === user.id);
    const deleted = await interaction.channel.bulkDelete(messages, true);
    await interaction.editReply({ content: `✅ تم مسح ${deleted.size} رسالة` });
  }
};
