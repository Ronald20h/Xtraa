const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbRun, dbAll, dbGet, ensureGuild, addLog } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('⚠️ تحذير عضو')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user   = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'لم يُذكر سبب';
    ensureGuild(interaction.guildId);
    dbRun('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?,?,?,?)',[interaction.guildId, user.id, interaction.user.id, reason]);
    const count = dbAll('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?',[interaction.guildId, user.id]).length;
    addLog(interaction.guildId, 'warn', interaction.user.id, user.id, reason);
    const member = interaction.guild.members.cache.get(user.id);
    if (member) member.send({ embeds: [new EmbedBuilder().setColor(0xffa500).setTitle(`⚠️ تحذير من ${interaction.guild.name}`).setDescription(`**السبب:** ${reason}\n**إجمالي تحذيراتك:** ${count}`)] }).catch(()=>{});
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffa500).setTitle('⚠️ تم التحذير')
      .addFields({name:'👤 العضو',value:user.tag,inline:true},{name:'📝 السبب',value:reason,inline:true},{name:'🔢 الإجمالي',value:`${count} تحذير`,inline:true})
      .setTimestamp()
    ]});
  }
};
