const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('poll').setDescription('إنشاء استفتاء / Create poll')
    .addStringOption(o => o.setName('question').setDescription('السؤال').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('الخيار 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('الخيار 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('الخيار 3'))
    .addStringOption(o => o.setName('option4').setDescription('الخيار 4')),
  async execute(interaction) {
    const q = interaction.options.getString('question');
    const opts = [1,2,3,4].map(i => interaction.options.getString(`option${i}`)).filter(Boolean);
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣'];
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`📊 ${q}`)
      .setDescription(opts.map((o,i) => `${emojis[i]} ${o}`).join('\n\n'))
      .setFooter({text:`استفتاء بواسطة ${interaction.user.tag}`}).setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < opts.length; i++) await msg.react(emojis[i]).catch(() => {});
  }
};
