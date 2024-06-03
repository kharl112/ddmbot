const fs = require("node:fs");
const path = require("node:path");

module.exports = async (client) => {
  const commandsPath = path.join(__dirname, "../commands");

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    command.forEach((cmd) => {
      client.commands.set(cmd.data.name, cmd);
    });
  }
};
