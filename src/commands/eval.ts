import {inspect} from 'util'
import Discord from 'discord.js'
import escapeRegex from 'escape-string-regexp'
import {me} from '../constants'
import type {Command} from '../types'

const kDiscardResult = Symbol('discard result')

const _: Command = {
  name: 'eval',
  aliases: ['e'],
  cooldown: 0,
  description: 'Evaluates some JS.',
  hidden: true,
  async execute(message, input) {
    const {author, channel} = message
    if (author.id !== me) {
      await channel.send('This command can only be done by the bot owner!')
      return
    }

    let result
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      result = await Function(`return async (message, input, Discord, _) => (${input.input})`)()(
        message, input, Discord, kDiscardResult
      )
    } catch (error) {
      await channel.send(`${error}`, {code: true})
      return
    }

    if (result !== kDiscardResult) {
      await channel.send(
        inspect(result).replace(new RegExp(escapeRegex(process.env.TOKEN!), 'ug'), '<token>'), {code: 'js', split: true}
      )
    }
  }
}
export default _

