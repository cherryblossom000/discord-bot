import type {RegexCommand} from '../types'

export default {
  regex: /noot\s*noot/i,
  regexMessage: message => `Noot noot, comrade ${message.guild ? message.member.displayName : message.author.username}.`
} as RegexCommand
