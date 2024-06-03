module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    //if its not a command - ignore
    if (!interaction.isChatInputCommand()) return;

    //get the command name from the slash commands
    const command = client.commands.get(interaction.commandName);

    //not a command? ignore
    if (!command) return;

    try {
      //execute interaction
      await command.execute(interaction);
    } catch (error) {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
