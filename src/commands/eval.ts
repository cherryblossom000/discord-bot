import {inspect} from 'util'
import Discord from 'discord.js'
import escapeRegex from 'escape-string-regexp'
import {me} from '../constants'
import type {Command, Message} from '../types'

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
      // Have to use implied eval: that's the point of this command. The result of the eval is also any, which can't
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-assignment -- be avoided.
      result = await (Function(`return async (message, input, Discord, _) => (${input.input})`) as () =>
      (
        message: Message,
        input: {args: string[], input: string},
        Discord: typeof import('discord.js'),
        _: typeof kDiscardResult
      ) => Promise<any>
      )()(message, input, Discord, kDiscardResult)
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
