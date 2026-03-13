require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initDB } = require('./bot/database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

client.commands = new Collection();

async function main() {
  // Init DB first
  await initDB();

  // Load Commands
  const commandsPath = path.join(__dirname, 'bot', 'commands');
  for (const folder of fs.readdirSync(commandsPath)) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
      try {
        const cmd = require(path.join(folderPath, file));
        if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
      } catch (e) { console.error(`Error loading ${file}:`, e.message); }
    }
  }
  console.log(`📦 Loaded ${client.commands.size} commands`);

  // Load Events
  const eventsPath = path.join(__dirname, 'bot', 'events');
  for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }

  // Start Dashboard
  require('./dashboard/app')(client);

  // Login
  await client.login(process.env.DISCORD_TOKEN);

  // Deploy Slash Commands
  const commands = [...client.commands.values()].map(c => c.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log(`✅ Registered ${commands.length} slash commands`);
  } catch (e) { console.error('Slash cmd error:', e.message); }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
process.on('unhandledRejection', err => console.error('Unhandled:', err?.message));
