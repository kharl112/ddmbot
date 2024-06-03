const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
require("dotenv").config()

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

// remove all existing slash commands 
rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
