const { createAudioPlayer, joinVoiceChannel, createAudioResource, VoiceConnectionStatus, NoSubscriberBehavior  } = require('@discordjs/voice');

const ytdl = require('ytdl-core');
const yts = require('yt-search');

module.exports = (() => {
  const play = async (interaction) => {
    try {
      const options = {
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.member.voice.guild.voiceAdapterCreator,
      }

      const connection = joinVoiceChannel(options);
      const player = createAudioPlayer();

      const song_query = interaction.options._hoistedOptions[0].value;
      const songInfo = await yts(song_query);

      const song = {
        title: songInfo.all[0].title,
        url: songInfo.all[0].url,
      };

      let stream = ytdl(song.url, {
          filter: "audioonly",
          quality: 'highestaudio',
          seek: 0 
      });

      const resource = createAudioResource(stream);
      player.play(resource);
      const subscription = connection.subscribe(player); 
            
      await interaction.reply({
        content: `playing rn ${song.title}`,
      });

    } catch (error) {
      console.log(error);
      await interaction.reply({ content: error, ephemeral: true });
    }
  };

  return { play };
})();
