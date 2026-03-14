const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuild, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('setwelcome').setDescription('إعداد رسالة الترحيب / Setup welcome')
    .addChannelOption(o => o.setName('channel').setDescription('قناة الترحيب').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('رسالة الترحيب ({user} {server} {count})').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await ensureGuild(interaction.guildId);
    const ch = interaction.options.getChannel('channel');
    const msg = interaction.options.getString('message') || 'أهلاً {user} في {server}! 🎉';
    await updateGuild(interaction.guildId, { welcome_channel: ch.id, welcome_message: msg });
    await interaction.reply({ content: `✅ تم إعداد الترحيب في <#${ch.id}>` });
  }
};
