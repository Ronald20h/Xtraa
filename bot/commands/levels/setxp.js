const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('setxp').setDescription('⭐ تعيين XP عضو يدوياً')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addIntegerOption(o => o.setName('xp').setDescription('كمية XP').setRequired(true).setMinValue(0))
    .addIntegerOption(o => o.setName('level').setDescription('المستوى').setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user  = interaction.options.getUser('user');
    const xp    = interaction.options.getInteger('xp');
    const level = interaction.options.getInteger('level') ?? Math.floor(Math.sqrt(xp/50));
    ensureGuild(interaction.guildId);
    dbRun('INSERT OR REPLACE INTO levels (guild_id, user_id, xp, level) VALUES (?,?,?,?)',[interaction.guildId, user.id, xp, level]);
    return interaction.reply({ content: `✅ تم تعيين XP لـ ${user}: **${xp} XP** — المستوى **${level}**`, ephemeral: true });
  }
};
