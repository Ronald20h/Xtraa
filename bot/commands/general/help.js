const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('قائمة الأوامر / Commands list'),
  async execute(interaction) {
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle('📋 Xtra Bot — قائمة الأوامر')
      .setDescription('اختر فئة من القائمة أدناه لعرض أوامرها')
      .addFields(
        {name:'📋 العامة',value:'16 أمر',inline:true},{name:'🛡️ الإدارية',value:'14 أمر',inline:true},
        {name:'🎫 التذاكر',value:'6 أوامر',inline:true},{name:'🎮 الألعاب',value:'6 أوامر',inline:true},
        {name:'🔒 الحماية',value:'5 أوامر',inline:true},{name:'📊 المستويات',value:'3 أوامر',inline:true},
        {name:'💬 الإيمبيد',value:'4 أوامر',inline:true},{name:'🤖 الردود التلقائية',value:'4 أوامر',inline:true},
        {name:'💎 بريميوم',value:'2 أمر',inline:true},
      )
      .setFooter({text:`Xtra Bot • ${interaction.client.commands.size} أمر | Developed by STEVEN`})
      .setThumbnail(interaction.client.user.displayAvatarURL());
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('help_menu').setPlaceholder('📂 اختر فئة').addOptions([
        {label:'📋 العامة',value:'general',emoji:'📋'},
        {label:'🛡️ الإدارية',value:'admin',emoji:'🛡️'},
        {label:'🎫 التذاكر',value:'tickets',emoji:'🎫'},
        {label:'🎮 الألعاب',value:'games',emoji:'🎮'},
        {label:'🔒 الحماية',value:'protection',emoji:'🔒'},
        {label:'📊 المستويات',value:'levels',emoji:'📊'},
        {label:'💬 الإيمبيد',value:'embed',emoji:'💬'},
        {label:'🤖 الردود التلقائية',value:'autorespond',emoji:'🤖'},
        {label:'💎 بريميوم',value:'premium',emoji:'💎'},
      ])
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
