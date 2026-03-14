const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('color').setDescription('🎨 معلومات لون HEX أو RGB')
    .addStringOption(o => o.setName('hex').setDescription('كود اللون مثال: #FF5733').setRequired(true)),
  async execute(interaction) {
    let hex = interaction.options.getString('hex').replace('#','');
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return interaction.reply({ content: '❌ أدخل كود HEX صحيح مثال: `#FF5733`', ephemeral: true });
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    const embed = new EmbedBuilder().setColor(`#${hex}`)
      .setTitle(`🎨 اللون #${hex.toUpperCase()}`)
      .setDescription(`**HEX:** \`#${hex.toUpperCase()}\`\n**RGB:** \`rgb(${r}, ${g}, ${b})\`\n**Decimal:** \`${parseInt(hex,16)}\``)
      .setThumbnail(`https://dummyimage.com/100x100/${hex}/${hex}.png`)
      .setFooter({ text: 'Xtra Bot • ألوان' });
    await interaction.reply({ embeds: [embed] });
  }
};
