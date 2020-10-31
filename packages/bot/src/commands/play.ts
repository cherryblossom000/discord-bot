import ytdl, {getBasicInfo, validateURL} from 'ytdl-core'
import yts from 'yt-search'
import {getGuild} from '../database'
import {checkPermissions, handleError, searchYoutube} from '../utils'
import {resume} from './resume'
import type {Command, Video} from '../types'

/** Converts a `yts.VideoSearchResult` into a `Video`. */
const searchToVideo = ({
  title,
  videoId: id,
  author: {name}
}: yts.VideoSearchResult): Video => ({title, id, author: name})

const command: Command<true> = {
  name: 'play',
  aliases: ['pl'],
  description: 'Plays a song from YouTube.',
  guildOnly: true,
  syntax: '[song]|search [query]',
  usage: `\`[song]\`
\`song\` (optional)
The video that you want to play. If it’s:
* a YouTube link or ID: plays the YouTube video
* anything else: searches YouTube and plays the first result
* omitted: resumes the music (if it’s paused) (the same as \`resume\`)

\`search [query]\`
\`query\`
The query to search on YouTube for.`,
  // TODO: Use information of the video when downloading instead of making a request twice
  // eslint-disable-next-line max-statements -- I don't know how else to shorten this function
  async execute(message, {args}, database) {
    const {
      channel,
      client,
      guild: {id},
      member
    } = message
    if (!(await checkPermissions(message, ['CONNECT', 'SPEAK']))) return

    const [url] = args
    let queue = client.queues.get(id)

    // Resume music if possible
    if (!url) {
      if (queue) {
        const {
          connection: {dispatcher}
        } = queue
        if (dispatcher.paused) await resume(dispatcher, message)
        else await channel.send('The music is already playing!')
      } else {
        await message.reply(
          'you must specify a valid YouTube URL to play! Noot noot.'
        )
      }
      return
    }

    const voiceChannel = member.voice.channel
    if (!voiceChannel) {
      await message.reply('you must join a voice channel first! Noot noot.')
      return
    }

    const play = async (song: Video): Promise<void> => {
      const cleanup = (): void => {
        queue!.voiceChannel.leave()
        client.queues.delete(id)
      }

      const playSong = async (_song?: Video): Promise<void> => {
        if (!_song) {
          cleanup()
          return
        }

        const errorHandler = (error: unknown): void =>
          handleError(
            client,
            error,
            `Error playing song: https://youtu.be/${_song.id}`
          )

        const dispatcher = queue!.connection
          .play(ytdl(_song.id, {filter: 'audioonly', quality: 'highestaudio'}))
          .on('finish', () => {
            queue!.songs.shift()
            playSong(queue!.songs[0]).catch(errorHandler)
          })
          .on('error', async error => {
            errorHandler(error)
            // eslint-disable-next-line promise/no-promise-in-callback -- not callback (event listener)
            await queue!.textChannel
              .send(
                `Unfortunately, there was an error playing **${_song.title}** (link: https://youtub.be/${_song.id}). Noot noot.`
              )
              .catch(_error =>
                handleError(
                  client,
                  _error,
                  `Error sending error message to channel with ID ${
                    queue!.textChannel.id
                  } about song https://youtu.be/${_song.id} failing to play:`
                )
              )
            cleanup()
          })
        const storedVolume = (await getGuild(database, id))?.volume
        if (storedVolume !== undefined && dispatcher.volume !== storedVolume)
          dispatcher.setVolume(storedVolume)
        await queue!.textChannel.send(
          `Playing **${_song.title}** by ${_song.author}.`
        )
      }

      if (queue) {
        queue.songs.push(song)
        await channel.send(`**${song.title}** has been added to the queue.`)
      } else {
        // eslint-disable-next-line require-atomic-updates -- queue will not cause a race condition
        queue = {
          textChannel: channel,
          voiceChannel,
          connection: await voiceChannel.join(),
          songs: [song]
        }
        client.queues.set(id, queue)
        await playSong(song)
      }
    }

    // Search for music
    if (url === 'search') {
      const video = await searchYoutube(message, args.slice(1).join(' '))
      if (video) await play(searchToVideo(video))
      return
    }

    // Play url
    if (validateURL(url)) {
      const {
        title,
        video_id: videoID,
        author: {name}
      } = await getBasicInfo(url)
      await play({title, id: videoID, author: name})
      return
    }

    // Search and play first result
    const query = args.join(' ')
    const {videos} = await yts(query)
    if (videos.length) await play(searchToVideo(videos[0]))
    else {
      await channel.send(
        `No results were found for ${query}. Try using a YouTube link instead.`
      )
    }
  }
}
export default command
