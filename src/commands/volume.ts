import {set} from '../helpers'
import type {Command} from '../types'

export default {
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
  execute: async ({channel, client: {queues}, guild}, args, database) => {
    const queue = queues.get(guild.id)
    if (queue) {
      const {connection: {dispatcher}} = queue
      if (args[0]?.toLowerCase().startsWith('r')) {
        dispatcher.setVolume(1)
        await channel.send('Reset the volume to 100%.')
        await set(database, guild, 'volume', 1)
        return
      }

      const input = args[0]?.replace(/%/g, '')
      if (isNaN(input as any)) await channel.send(`The current volume is ${dispatcher.volume * 100}%.`)
      else {
        const n = Number(input) / 100
        const newVolume = input.startsWith('+') || input.startsWith('-') ? dispatcher.volume + n : n
        dispatcher.setVolume(newVolume)
        await channel.send(`Set the volume to ${newVolume * 100}%.`)
        await set(database, guild, 'volume', newVolume)
      }
    } else await channel.send('No music is playing!')
  }
} as Command<true>
