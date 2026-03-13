const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('setxp').setDescription('تعيين XP / Set XP')
    .addUserOption(o => o.setName('user').setDescription('المستخدم').setRequired(true))
    .addIntegerOption(o => o.setName('xp').setDescription('كمية XP').setMinValue(0).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const xp = interaction.options.getInteger('xp');
    await ensureGuild(interaction.guildId);
    await dbRun('INSERT OR REPLACE INTO levels (guild_id, user_id, xp, level, messages) VALUES (?, ?, ?, ?, 0)', [interaction.guildId, user.id, xp, Math.floor(xp/100)]);
    await interaction.reply({ content: `✅ تم تعيين **${xp} XP** لـ ${user.tag} (مستوى ${Math.floor(xp/100)})` });
  }
};
