import ytdl, {getBasicInfo, validateURL} from 'ytdl-core'
import yts from 'yt-search'
import {fetchValue} from '../database'
import {checkPermissions, handleError, searchYoutube} from '../utils'
import {resume} from './resume'
import type {GuildOnlyCommand, Video} from '../types'

/** Converts a `yts.VideoSearchResult` into a `Video`. */
const searchToVideo = ({
  title,
  videoId: id,
  author: {name}
}: yts.VideoSearchResult): Video => ({title, id, author: name})

const command: GuildOnlyCommand = {
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
    if (!(url ?? '')) {
      if (queue) {
        const {
          connection: {dispatcher}
        } = queue
        await (dispatcher.paused
          ? resume(dispatcher, message)
          : channel.send('The music is already playing!'))
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

    const cleanup = (): void => {
      queue!.voiceChannel.leave()
      client.queues.delete(id)
    }

    const mkErrorHandler =
      (internalMessage: string, userMessage: string) =>
      async (error: unknown): Promise<void> => {
        handleError(client, error, internalMessage)
        // eslint-disable-next-line promise/no-promise-in-callback -- not a callback
        await queue!.textChannel
          .send(userMessage)
          .catch(innerError =>
            handleError(
              client,
              innerError,
              `Error sending message to ${queue!.textChannel.id} (#${
                queue!.textChannel.name
              }) about error in play command: ${internalMessage}`
            )
          )
        cleanup()
      }

    const playSong = async (song?: Video): Promise<void> => {
      if (!song) {
        cleanup()
        return
      }

      const errorHandler = mkErrorHandler(
        `Error playing song: https://youtu.be/${song.id}`,
        `Unfortunately, there was an error playing **${song.title}** (link: https://youtub.be/${song.id}). Noot noot.`
      )

      const dispatcher = queue!.connection
        .play(ytdl(song.id, {filter: 'audioonly', quality: 'highestaudio'}))
        .on('finish', () => {
          queue!.songs.shift()
          playSong(queue!.songs[0]).catch(errorHandler)
        })
        .on('error', errorHandler)
      const storedVolume = await fetchValue(database, 'guilds', id, 'volume')
      if (storedVolume !== undefined && dispatcher.volume !== storedVolume)
        dispatcher.setVolume(storedVolume)
      await queue!.textChannel.send(
        `Playing **${song.title}** by ${song.author}.`
      )
    }

    const play = async (song: Video): Promise<void> => {
      if (queue) {
        queue.songs.push(song)
        await channel.send(`**${song.title}** has been added to the queue.`)
      } else {
        const internalErrorMessage = (event: string): string =>
          `\`${event}\` event connecting to voice channel ${voiceChannel.id} (${voiceChannel.name})`
        const errorMessage = `Unfortunately, there was an error playing connecting to the voice channel **${voiceChannel.name}**. Noot noot.`
        // eslint-disable-next-line require-atomic-updates -- queue will not cause a race condition
        queue = {
          textChannel: channel,
          voiceChannel,
          connection: (await voiceChannel.join())
            .on(
              'failed',
              mkErrorHandler(internalErrorMessage('failed'), errorMessage)
            )
            .on(
              'error',
              mkErrorHandler(internalErrorMessage('error'), errorMessage)
            )
            .on('warn', error =>
              handleError(
                client,
                typeof error == 'string' ? new Error(error) : error,
                internalErrorMessage('warn')
              )
            ),
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
    if (validateURL(url!)) {
      const {title, videoId, author} = (await getBasicInfo(url!))
        .player_response.videoDetails
      await play({title, id: videoId, author})
      return
    }

    // Search and play first result
    const query = args.join(' ')
    const {videos} = await yts(query)
    await (videos.length
      ? play(searchToVideo(videos[0]!))
      : channel.send(
          `No results were found for ${query}. Try using a YouTube link instead.`
        ))
  }
}
export default command
