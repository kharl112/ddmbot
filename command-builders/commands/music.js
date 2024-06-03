const { SlashCommandBuilder } = require("discord.js");

//controllers
const MusicController = require("../controllers/music");

//commmands
module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play a song from youtube.")
      .addStringOption((option) =>
        option
          .setName('search_song')
          .setDescription("search for in-game teams")
          .setRequired(true)
      ),
    async execute(interaction) {
      await MusicController.play(interaction);
    },
  },
];
