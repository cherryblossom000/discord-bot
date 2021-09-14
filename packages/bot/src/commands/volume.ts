import {setValue} from '../database.js'
import {getQueue} from '../utils.js'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'volume',
  aliases: ['v'],
  description: 'Changes or gets the volume of the music playing.',
  syntax: '[volume]',
  usage: `\`volume\` (optional)
The new volume as a percentage to set it to. If omitted, the current volume will be shown. Can be one of the following:
* \`<number>[%]\` Sets the current volume.
* \`<+|-><number>[%]\` Increments/decrements the volume.
* \`reset\` (or anything starting with \`r\`) Resets the volume to 100%.`,
  guildOnly: true,
  async execute(message, {args: [rawInput]}, database) {
    const queue = await getQueue(message)
    if (!queue) return

    const {channel, guild} = message
    const {
      connection: {dispatcher}
    } = queue
    if (rawInput?.toLowerCase().startsWith('r') ?? false) {
      dispatcher.setVolume(1)
      await channel.send('Reset the volume to 100%.')
      await setValue(database, 'guilds', guild, 'volume', 1)
      return
    }

    const input = rawInput?.replace(/%/gu, '')
    if ((isNaN as <T>(number: T) => number is Extract<T, undefined>)(input))
      await channel.send(`The current volume is ${dispatcher.volume * 100}%.`)
    else {
      const n = Number(input) / 100
      const newVolume =
        input.startsWith('+') || input.startsWith('-')
          ? dispatcher.volume + n
          : n
      dispatcher.setVolume(newVolume)
      await channel.send(`Set the volume to ${newVolume * 100}%.`)
      await setValue(database, 'guilds', guild, 'volume', newVolume)
    }
  }
}
export default command
