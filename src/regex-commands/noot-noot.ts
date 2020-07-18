import type {RegexCommand} from '../types'

const command: RegexCommand = {
  regex: /no{2,}t\s*no{2,}t/ui,
  regexMessage: message => `Noot noot, comrade ${message.guild ? message.member.displayName : message.author.username}.`
}
export default command
