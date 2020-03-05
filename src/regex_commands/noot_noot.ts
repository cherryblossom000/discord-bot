import type {Message} from 'discord.js'
import type {PinguRegexCommand} from '../types'

export default {
  regex: /noot\s*noot/i,
  execute: (message: Message) => {
    message.channel.send(`Noot noot, comrade ${message.guild ? message.member!.displayName : message.author.username}.`)
  }
} as PinguRegexCommand
