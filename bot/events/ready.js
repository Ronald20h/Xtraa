const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online!`);
    const activities = [
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: '/help | Xtra Bot', type: ActivityType.Playing },
      { name: `${client.users.cache.size} users`, type: ActivityType.Watching },
    ];
    let i = 0;
    setInterval(() => {
      client.user.setActivity(activities[i % activities.length]);
      i++;
    }, 10000);
  }
};
