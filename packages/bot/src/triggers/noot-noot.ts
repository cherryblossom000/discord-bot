import type {Trigger} from '../types'

const trigger: Trigger = {
  regex: /no{2,}t\s*no{2,}t/iu,
  message: message =>
    `Noot noot, comrade ${
      message.guild ? message.member.displayName : message.author.username
    }.`
}
export default trigger
