const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuild, ensureGuild } = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('setlang').setDescription('تغيير لغة البوت / Change language')
    .addStringOption(o => o.setName('lang').setDescription('اللغة').addChoices({name:'العربية',value:'ar'},{name:'English',value:'en'}).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await ensureGuild(interaction.guildId);
    await updateGuild(interaction.guildId, { lang: interaction.options.getString('lang') });
    await interaction.reply({ content: interaction.options.getString('lang') === 'ar' ? '✅ تم تغيير اللغة إلى العربية' : '✅ Language changed to English', ephemeral: true });
  }
};
