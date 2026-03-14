const { EmbedBuilder } = require('discord.js');
const { dbGet } = require('../database');
const snipeModule = require('../commands/general/snipe');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (message.partial || message.author?.bot) return;
    // Cache for snipe
    snipeModule.snipeCache.set(message.channelId, {
      content: message.content,
      author: message.author?.tag || 'مجهول',
      avatar: message.author?.displayAvatarURL({ dynamic: true }) || '',
      timestamp: Date.now()
    });
    // Clear after 60s
    setTimeout(() => snipeModule.snipeCache.delete(message.channelId), 60000);
  }
};
