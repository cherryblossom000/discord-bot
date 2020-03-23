import ytdl, {getBasicInfo, validateURL} from 'ytdl-core'
import yts from 'yt-search'
import {checkPermissions, hasPermissions, reply, searchYoutube, sendMeError} from '../helpers'
import {emojis} from '../constants'
import type {Command, Video} from '../types'

/** Converts a `yts.VideoSearchResult` into a `Video`. */
const searchToVideo = ({title, videoId: id, author: {name}}: yts.VideoSearchResult): Video => ({title, id, author: name})

export default {
  name: 'play',
  aliases: ['pl'],
  description: 'Plays a song from YouTube.',
  guildOnly: true,
  syntax: '[song]|search [query]',
  usage: `\`[song]\`
\`song\` (optional)
The video that you want to play. If it\u2019s:
* a YouTube link or ID: plays the YouTube video
* anything else: searches YouTube and plays the first result
* omitted: resumes the music (if it\u2019s paused) (the same as \`resume\`)

\`search [query]\`
\`query\`
The query to search on YouTube for.`,
  execute: async (message, args, database) => {
    const {channel, client, guild, member} = message
    if (!checkPermissions(message, ['CONNECT', 'SPEAK'])) return

    const voiceChannel = member?.voice.channel
    if (!voiceChannel) {
      await reply(message, 'you must join a voice channel first! Noot noot.')
      return
    }

    const [url] = args
    let queue = client.queues.get(guild.id)

    // resume music if possible
    if (!url) {
      if (queue) {
        const {connection: {dispatcher}} = queue
        if (dispatcher.paused) {
          dispatcher.resume()
          if (hasPermissions(message, 'READ_MESSAGE_HISTORY')) await message.react(emojis.resume)
          else {
            channel.send(`Resumed the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`)
          }
        } else await channel.send('The music is already playing!')
      } else await reply(message, 'you must specify a valid YouTube URL to play! Noot noot.')

      return
    }

    const play = async (song: Video): Promise<void> => {
      const playSong = async (song?: Video): Promise<void> => {
        const {client, id} = guild, queue = client.queues.get(id)!
        if (!song) {
          queue.voiceChannel.leave()
          client.queues.delete(id)
          return
        }

        const dispatcher = queue.connection
          .play(ytdl(song.id, {filter: 'audioonly', quality: 'highestaudio'}))
          .on('finish', () => {
            queue.songs.shift()
            playSong(queue.songs[0])
          })
          .on('error', error => {
            sendMeError(client, error, `Error playing song: https://youtu.be/${song.id}`)
            queue.textChannel.send(`Unfortunately, there was an error playing \u2018${song.title}\u2019 ` +
              `(link: https://youtub.be/${song.id}). Noot noot.`)
          })
        const storedVolume = (await database.get(guild.id))?.volume
        if (storedVolume && dispatcher.volume !== storedVolume) dispatcher.setVolume(storedVolume)
        queue.textChannel.send(`Playing \u2018${song.title}\u2019 by ${song.author}.`)
      }

      if (queue) {
        queue.songs.push(song)
        channel.send(`\u2018${song.title}\u2019 has been added to the queue.`)
      } else {
        queue = {
          textChannel: channel,
          voiceChannel,
          connection: await voiceChannel.join(),
          songs: [song]
        }
        client.queues.set(guild.id, queue)
        await playSong(song)
      }
    }

    // search for music
    if (url === 'search') {
      const video = await searchYoutube(message, args.slice(1).join(' '))
      if (video) play(searchToVideo(video))
      return
    }

    // play url
    if (validateURL(url)) {
      const {title, video_id: id, author: {name}} = await getBasicInfo(url)
      return play({title, id, author: name})
    }

    // search and play first result
    const query = args.join(' '), {videos} = await yts(query)
    if (!videos.length) return channel.send(`No results were found for ${query}. Try using a YouTube link instead.`)
    play(searchToVideo(videos[0]))
  }
} as Command<true>
