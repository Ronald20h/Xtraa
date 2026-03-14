const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('enlarge').setDescription('🔍 تكبير إيموجي مخصص')
    .addStringOption(o => o.setName('emoji').setDescription('الإيموجي المخصص').setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('emoji');
    const custom = input.match(/<a?:(\w+):(\d+)>/);
    if (!custom) return interaction.reply({ content: '❌ يعمل فقط مع الإيموجيات المخصصة للسيرفر!', ephemeral: true });
    const [,name, id] = custom;
    const ext = input.startsWith('<a:') ? 'gif' : 'png';
    const url = `https://cdn.discordapp.com/emojis/${id}.${ext}`;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865f2')
      .setTitle(`🔍 ${name}`).setImage(`${url}?size=256`)
      .addFields({ name: '🆔 ID', value: id, inline: true }, { name: '📛 الاسم', value: name, inline: true })] });
  }
};
