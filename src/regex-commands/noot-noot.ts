import type {RegexCommand} from '../types'

const _: RegexCommand = {
  regex: /noot\s*noot/ui,
  regexMessage: message => `Noot noot, comrade ${message.guild ? message.member.displayName : message.author.username}.`
}
export default _
