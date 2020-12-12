import {emojis} from '../constants'
import type {RegexCommand} from '../types'

const command: RegexCommand = {
  regex: /cummunis(?:m|t)/iu,
  regexMessage: `Noot noot ${emojis.smirk}`
}
export default command
