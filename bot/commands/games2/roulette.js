const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dbGet } = require('../../database');

const SLOTS = ['🍎','🍋','🍇','🍒','💎','7️⃣','🔔','⭐','🌸','🃏'];
const COLORS_ROULETTE = ['🔴','⚫','🔴','⚫','🔴','⚫','🔴','⚫','🔴','⚫','🔴','⚫','🔴','⚫','🔴','⚫','🔴','⚫','⬛','🔴','⚫'];

module.exports = {
  data: new SlashCommandBuilder().setName('roulette').setDescription('🎰 روليت — لعبة العجلة الكلاسيكية')
    .addStringOption(o => o.setName('bet').setDescription('راهن على: red/black/number (0-36)').setRequired(true)),
  async execute(interaction) {
    const bet = interaction.options.getString('bet').toLowerCase();
    const spin = Math.floor(Math.random() * 37);
    const color = spin === 0 ? '⬛' : (spin % 2 === 0 ? '⚫' : '🔴');
    let won = false;
    if (bet === 'red' || bet === 'أحمر') won = color === '🔴';
    else if (bet === 'black' || bet === 'أسود') won = color === '⚫';
    else if (!isNaN(bet)) won = parseInt(bet) === spin;

    const wheel = ['◀️'];
    for (let i = 0; i < 9; i++) wheel.push(COLORS_ROULETTE[Math.floor(Math.random() * COLORS_ROULETTE.length)]);
    wheel.push('▶️');
    wheel[5] = color;

    await interaction.deferReply();
    // Animation frames
    const frames = [
      wheel.map((x,i) => i === 5 ? '❓' : x).join(' '),
      wheel.map((x,i) => i === 5 ? '🎯' : x).join(' '),
      wheel.join(' ')
    ];
    const msg = await interaction.editReply({ content: `🎰 **تدور العجلة...**\n${frames[0]}` });
    await new Promise(r => setTimeout(r, 800));
    await interaction.editReply({ content: `🎰 **تدور العجلة...**\n${frames[1]}` });
    await new Promise(r => setTimeout(r, 800));

    const embed = new EmbedBuilder()
      .setColor(won ? '#00ff88' : '#ff4444')
      .setTitle(`🎰 روليت — ${won ? '🏆 فزت!' : '💀 خسرت!'}`)
      .setDescription(`${wheel.join(' ')}\n\n**🎯 الرقم:** \`${spin}\` ${color}\n**🎲 راهنت على:** \`${bet}\`\n\n${won ? '🥳 **رائع! راهنت صح!**' : '😢 **للأسف راهنت غلط!**'}`)
      .setFooter({ text: 'Xtra Bot • روليت' }).setTimestamp();
    await interaction.editReply({ content: '', embeds: [embed] });
  }
};
