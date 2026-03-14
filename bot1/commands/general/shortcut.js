const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('shortcut').setDescription('تعيين اختصار لأمر / Set command shortcut')
    .addStringOption(o => o.setName('command').setDescription('اسم الأمر').setRequired(true))
    .addStringOption(o => o.setName('shortcut').setDescription('الاختصار').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const cmd = interaction.options.getString('command');
    const shortcut = interaction.options.getString('shortcut');
    await ensureGuild(interaction.guildId);
    await dbRun('INSERT OR REPLACE INTO commands (guild_id, command_name, shortcut) VALUES (?, ?, ?)', [interaction.guildId, cmd, shortcut]);
    await interaction.reply({ content: `✅ تم تعيين الاختصار \`${shortcut}\` للأمر \`${cmd}\``, ephemeral: true });
  }
};
