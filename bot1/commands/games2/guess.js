const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sessions = new Map();
module.exports = {
  data: new SlashCommandBuilder().setName('guess').setDescription('🔢 خمّن الرقم (بين 1 و 100)'),
  async execute(interaction) {
    const secret = Math.floor(Math.random() * 100) + 1;
    const key = `${interaction.channelId}-${interaction.user.id}`;
    sessions.set(key, { secret, attempts: 0, max: 7 });
    const row = new ActionRowBuilder().addComponents(
      ...[10, 25, 50, 75, 90].map(n =>
        new ButtonBuilder().setCustomId(`guess_${key}_${n}`).setLabel(`${n}`).setStyle(ButtonStyle.Secondary)
      )
    );
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffd700').setTitle('🔢 خمّن الرقم!')
      .setDescription(`خمّن رقماً بين **1 و 100**\nلديك **7 محاولات**!\n\nاستخدم \`/guess number\` للإجابة أو الأزرار السريعة 👇`)
      .setFooter({ text: 'Xtra Bot • لعبة خمّن' })], components: [row] });
  }
};
module.exports.sessions = sessions;
