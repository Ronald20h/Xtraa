const { EmbedBuilder } = require('discord.js');

function successEmbed(desc, title = null) {
  const e = new EmbedBuilder().setColor('#00ff88').setDescription(`✅ ${desc}`);
  if (title) e.setTitle(title);
  return e;
}

function errorEmbed(desc) {
  return new EmbedBuilder().setColor('#ff4444').setDescription(`❌ ${desc}`);
}

function infoEmbed(desc, title = null) {
  const e = new EmbedBuilder().setColor('#5865F2').setDescription(desc);
  if (title) e.setTitle(title);
  return e;
}

function warnEmbed(desc) {
  return new EmbedBuilder().setColor('#ffa500').setDescription(`⚠️ ${desc}`);
}

function xtraEmbed(title, desc, color = '#5865F2') {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: 'Xtra Bot', iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png' })
    .setTimestamp();
}

module.exports = { successEmbed, errorEmbed, infoEmbed, warnEmbed, xtraEmbed };
