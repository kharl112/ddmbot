const { Client, GatewayIntentBits, Collection } = require("discord.js");
const initializeCommands = require("./command-builders/handlers/initialize");
const initializeEvents = require("./event-handlers/handlers/initialize");
require("dotenv").config();

//apply fallback just in case
const token = process.env.DISCORD_BOT_TOKEN || "";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection();

initializeEvents(client);
initializeCommands(client);

client.login(token);
