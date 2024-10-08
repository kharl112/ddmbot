const { 
  createAudioPlayer, 
  joinVoiceChannel,
  createAudioResource, 
  VoiceConnectionStatus,
  entersState, 
  NoSubscriberBehavior, 
  getVoiceConnection,
  AudioPlayerStatus  
} = require('@discordjs/voice');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

  const get_song = async (song_query) => {
    const songInfo = await yts(song_query);

    if(!songInfo.all.length)  return null;

    return new_song = {
      title: songInfo.all[0].title,
      url: songInfo.all[0].url,
    }

  }

  const get_resource_from_queue = (channel_id)  => {
    if(!map_songs.hasOwnProperty(channel_id)) return null;
    if(!map_songs[channel_id].length) {
      delete map_songs[channel_id];
    };

    let song = map_songs[channel_id].shift();
    if(!map_songs[channel_id].length) {
      delete map_songs[channel_id];
    };
    return { resource: get_audio_resource_stream(song), song } ;
  }

  const play = async (interaction) => {

    //user needs to wait (bot is thinking...)
    await interaction.deferReply();

    const member_channel_id = interaction.member.voice.channelId;
    //check if user is on a voice channel 
    if(!member_channel_id) {
      await interaction.editReply({
        content: `you're not in a voice channel`,
        ephemeral: true
      });

      return;
    }

    //set options for the connection
    const options = {
      channelId: member_channel_id,
      guildId: interaction.guildId,
      adapterCreator: interaction.member.voice.guild.voiceAdapterCreator,
    }

    //get connection
    let connection = getVoiceConnection(options.guildId);

    //create new connection if theres no connection
    if(!connection){
      connection = joinVoiceChannel(options);
    }

    //check if bot is connected to another channel
    else if(connection.packets.state && connection.packets.state.channel_id && member_channel_id != connection.packets.state.channel_id){
      await interaction.editReply({
        content: `bot is on another channel`,
        ephemeral: true
      });

      return;
    }

    //when bot intentionally/unintentionally disconnected
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {

        //garbage collection
        if(getVoiceConnection(options.guildId)){
          connection.destroy();
        }

        await interaction.editReply({
          content: `Bro got disconnected`, 
        });

        //clear music queue
        delete map_songs[member_channel_id];

        return;
      }
    }); 


    //get song from yt
    const song_query = interaction.options._hoistedOptions[0].value;
    const new_song = await get_song(song_query);

    //ignore if song does not exists
    if(!new_song) {
      await interaction.editReply({
        content: `no audio found for query: ${song_query}`,
      });

      return;
    }

    //add new song to queue
    if(!map_songs.hasOwnProperty(member_channel_id)){
      map_songs[member_channel_id] = [new_song]
    } else{
      //check again if theres no connection
      if(getVoiceConnection(options.guildId)){
        map_songs[member_channel_id] = [...map_songs[member_channel_id], new_song];
        await interaction.editReply({
          content: `added on queue ${new_song.title}`,
        });
        return;
      }
    }

    //create audio player
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      },
    });

    //subscription
    connection.subscribe(player);

    let current = get_resource_from_queue(member_channel_id);
    if(current) {
      player.play(current.resource);
    }

    player.on('error', async (error) => {
      console.error(`Error: ${error.message}`);
      await interaction.followUp({ content: `error playing current music : ${error.message}`});
      current = get_resource_from_queue(member_channel_id);
      if(current) {
        player.play(current.resource);
      }
    });

    player.on(AudioPlayerStatus.Idle, () => {
      current = get_resource_from_queue(member_channel_id);
      if(current) {
        player.play(current.resource);
      }
    });

    player.on(AudioPlayerStatus.Playing, async () => {
      if(current) {
        const next_btn = new ButtonBuilder()
          .setCustomId('play_next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Success);

        const stop_btn = new ButtonBuilder()
          .setCustomId('stop')
          .setLabel('Stop')
          .setStyle(ButtonStyle.Danger);



        const action_row = new ActionRowBuilder()
          .addComponents(next_btn, stop_btn);

        const response = await interaction.followUp({ content: `playing rn ${current.song.title}`, components: [action_row] });
        const confirmation = await response.awaitMessageComponent();

        if (confirmation.customId === 'play_next') {
          await confirmation.update({ content: `playing next audio`, components: [] });
          current = get_resource_from_queue(member_channel_id);
          if(current) {
            player.play(current.resource);
          }else {
            await interaction.editReply({ content: `No songs left on the queue`})
          }
        } 

        if (confirmation.customId === 'stop') {
          player.stop();
          await confirmation.update({ content: `player stopped`, components: [] });
        }
      }
    });
  };

  return { play };
})();
