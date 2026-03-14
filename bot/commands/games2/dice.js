const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('dice').setDescription('🎲 رمي نرد')
    .addIntegerOption(o => o.setName('sides').setDescription('عدد الأوجه (افتراضي: 6)').setMinValue(2).setMaxValue(100))
    .addIntegerOption(o => o.setName('count').setDescription('عدد النرد (افتراضي: 1)').setMinValue(1).setMaxValue(10)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const count = interaction.options.getInteger('count') || 1;
    const dice = []; let total = 0;
    for (let i = 0; i < count; i++) { const r = Math.floor(Math.random() * sides) + 1; dice.push(r); total += r; }
    const FACES = {1:'1️⃣',2:'2️⃣',3:'3️⃣',4:'4️⃣',5:'5️⃣',6:'6️⃣'};
    const embed = new EmbedBuilder().setColor('#5865f2').setTitle('🎲 رمي النرد')
      .setDescription(`${dice.map(d => FACES[d] || `\`${d}\``).join(' ')}\n\n**المجموع:** \`${total}\`${count > 1 ? ` من **${count}** نرد` : ''}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
