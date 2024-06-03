const fs = require("node:fs");
const path = require("node:path");
const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

//set commands as an empty array
const commands = [];
//get the full path of the commands directory
const commandsPath = path.join(__dirname, "../commands");

//get all the .js file from the commandsPath
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  //append commands from commands.js
  command.forEach((cmd) => {
    commands.push(cmd.data);
  });
}

//register all commands
rest
  .put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
    body: [...commands],
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
