import {getQueue, set} from '../helpers'
import type {Command} from '../types'

const command: Command <true> = {
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
  execute: async (message, args, database) => {
    const queue = getQueue(message)
    if (!queue) return

    const {channel, guild} = message, {connection: {dispatcher}} = queue
    if (args[0]?.toLowerCase().startsWith('r')) {
      dispatcher.setVolume(1)
      await channel.send('Reset the volume to 100%.')
      await set(database, guild, 'volume', 1)
      return
    }

    const input = args[0]?.replace(/%/g, '')
    if (isNaN(input as any)) await channel.send(`The current volume is ${dispatcher.volume * 100}%.`)
    else {
      const n = Number(input) / 100, newVolume = input.startsWith('+') || input.startsWith('-') ? dispatcher.volume + n : n
      dispatcher.setVolume(newVolume)
      await channel.send(`Set the volume to ${newVolume * 100}%.`)
      await set(database, guild, 'volume', newVolume)
    }
  }
}
export default command
