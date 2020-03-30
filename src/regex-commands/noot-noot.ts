import type {RegexCommand} from '../types'

const command: RegexCommand = {
  regex: /noot\s*noot/i,
  regexMessage: message => `Noot noot, comrade ${message.guild ? message.member.displayName : message.author.username}.`
}
export default command
