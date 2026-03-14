const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const games = new Map();

module.exports = {
  data: new SlashCommandBuilder().setName('xo').setDescription('❌⭕ لعبة XO مع شخص آخر')
    .addUserOption(o => o.setName('opponent').setDescription('المنافس').setRequired(true)),
  async execute(interaction) {
    const opp = interaction.options.getMember('opponent');
    if (!opp || opp.user.bot) return interaction.reply({ content: '❌ اختر منافساً صحيحاً', ephemeral: true });
    if (opp.id === interaction.user.id) return interaction.reply({ content: '❌ لا يمكنك اللعب مع نفسك', ephemeral: true });
    const gameId = `${interaction.channelId}`;
    games.set(gameId, {
      board: Array(9).fill(null), players: [interaction.user.id, opp.user.id],
      current: 0, symbols: ['❌', '⭕']
    });
    const game = games.get(gameId);
    await interaction.reply({ content: `**❌ ${interaction.user} vs ⭕ ${opp}**\nدور: ${interaction.user}`, components: buildBoard(game, gameId), embeds: [] });
  }
};

function buildBoard(game, gameId) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      const cell = game.board[i];
      row.addComponents(new ButtonBuilder()
        .setCustomId(`xo_${gameId}_${i}`)
        .setLabel(cell || '·')
        .setStyle(cell ? (cell === '❌' ? ButtonStyle.Danger : ButtonStyle.Primary) : ButtonStyle.Secondary)
        .setDisabled(!!cell));
    }
    rows.push(row);
  }
  return rows;
}

function checkWin(board, sym) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(([a,b,c]) => board[a]===sym && board[b]===sym && board[c]===sym);
}

// XO button handler - registered in interactionCreate
module.exports.handleXO = async (interaction, games) => {
  const parts = interaction.customId.split('_');
  const gameId = parts[1];
  const cell = parseInt(parts[2]);
  const game = games.get(gameId);
  if (!game) return interaction.reply({ content: '❌ اللعبة انتهت', ephemeral: true });
  if (game.players[game.current] !== interaction.user.id) return interaction.reply({ content: '❌ ليس دورك!', ephemeral: true });
  if (game.board[cell]) return interaction.reply({ content: '❌ هذه الخانة مشغولة', ephemeral: true });
  game.board[cell] = game.symbols[game.current];
  const won = checkWin(game.board, game.symbols[game.current]);
  const full = game.board.every(c => c);
  if (won) {
    games.delete(gameId);
    return interaction.update({ content: `🏆 ${interaction.user} فاز! ${game.symbols[game.current]}`, components: buildBoard(game, gameId) });
  }
  if (full) { games.delete(gameId); return interaction.update({ content: '🤝 تعادل!', components: buildBoard(game, gameId) }); }
  game.current = 1 - game.current;
  const nextPlayer = await interaction.guild.members.fetch(game.players[game.current]).catch(() => null);
  await interaction.update({ content: `دور: <@${game.players[game.current]}> ${game.symbols[game.current]}`, components: buildBoard(game, gameId) });
};

module.exports.games = games;
