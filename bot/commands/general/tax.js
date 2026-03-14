const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbAll } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tax')
    .setDescription('احسب الضريبة على مبلغ معين')
    .addNumberOption(o => o.setName('amount').setDescription('المبلغ').setRequired(true))
    .addNumberOption(o => o.setName('rate').setDescription('نسبة الضريبة % (افتراضي: 15%)').setRequired(false)),
  async execute(interaction) {
    const amount = interaction.options.getNumber('amount');
    const rooms = dbAll('SELECT * FROM tax_rooms WHERE guild_id = ? AND enabled = 1', [interaction.guildId]);
    const rate = interaction.options.getNumber('rate') || (rooms[0]?.tax_rate ?? 15);
    const taxAmount = (amount * rate / 100);
    const total = amount + taxAmount;
    const embed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle('💰 حاسبة الضريبة')
      .addFields(
        { name: '💵 المبلغ الأصلي', value: `\`${amount.toLocaleString()}\``, inline: true },
        { name: '📊 نسبة الضريبة', value: `\`${rate}%\``, inline: true },
        { name: '💸 قيمة الضريبة', value: `\`${taxAmount.toLocaleString()}\``, inline: true },
        { name: '💎 المجموع النهائي', value: `\`\`\`${total.toLocaleString()}\`\`\``, inline: false }
      )
      .setFooter({ text: 'Xtra Bot • نظام الضريبة' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
