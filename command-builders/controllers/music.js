const { createAudioPlayer, joinVoiceChannel, createAudioResource, VoiceConnectionStatus, NoSubscriberBehavior, getVoiceConnection, AudioPlayerStatus  } = require('@discordjs/voice');

const { client } = require('../../main.js');

const ytdl = require("@distube/ytdl-core");
const yts = require('yt-search');

const player = createAudioPlayer();

const map_songs = {};

module.exports = (() => {

  const get_audio_resource_stream = (song) => {
    let stream = ytdl(song.url, {
      filter: "audioonly",
      quality: 'highestaudio',
      seek: 0 
    });

    return createAudioResource(stream);
  }

  const play = async (interaction) => {
    try {
      const options = {
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.member.voice.guild.voiceAdapterCreator,
      }

      await interaction.deferReply();

      const song_query = interaction.options._hoistedOptions[0].value;
      const songInfo = await yts(song_query);

      const new_song = {
        title: songInfo.all[0].title,
        url: songInfo.all[0].url,
      };

      if(!map_songs.hasOwnProperty(options.channelId)){
        map_songs[options.channelId] = [new_song]
      }else{
        map_songs[options.channelId] = [...map_songs[options.channelId], new_song];
        await interaction.editReply({
          content: `added on queue ${new_song.title}`,
        });
        return;
      }

      let connection = getVoiceConnection(options.guildId);
      if(!connection){
        connection = joinVoiceChannel(options);
      }

      let song = map_songs[options.channelId].shift();
      let resource = get_audio_resource_stream(song);

      const subscription = connection.subscribe(player); 

      player.play(resource);
      const channel = client.channels.cache.get(options.channelId);

      player.on('error', async (error) => {
        if(map_songs[options.channelId].length){
          song = map_songs[options.channelId].shift();
          let resource = get_audio_resource_stream(song);
          player.play(resource);
          await interaction.followUp(`playing rn ${song.title}`);
        }else {
          connection.destroy();
          await interaction.followUp('I left');
        }
      });

      player.on(AudioPlayerStatus.Idle, async () => {
        if(map_songs[options.channelId].length){
          song = map_songs[options.channelId].shift();
          let resource = get_audio_resource_stream(song);
          player.play(resource);
          await interaction.followUp(`playing rn ${song.title}`);
        }else {
          connection.destroy();
          await interaction.followUp('I left');
        }
      });

      await interaction.editReply({
        content: `playing rn ${song.title}`,
      });

    } catch (error) {
      console.log(error);
      await interaction.reply({ content: error, ephemeral: true });
    }
  };

  return { play };
})();
