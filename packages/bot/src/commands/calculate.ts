import {ResultSet, evaluate, simplify} from 'mathjs'
import type {Command} from '../types'

interface _MathResult {
  toTex?: () => string
  toString: () => string
}

type MathResult = ResultSet<_MathResult> | _MathResult

const resultToString = (result: _MathResult): string =>
  result.toTex ? result.toTex() : result.toString()

const command: Command = {
  name: 'calculate',
  aliases: ['c', 'calculator'],
  description: 'Calculates a maths expression',
  syntax: '<expression>',
  usage: `\`expression\`
The expression to calculate. See https://mathjs.org/docs/expressions/syntax.html for more information.`,
  async execute(message, {input}) {
    const handleError = async (error: unknown): Promise<void> => {
      await message.reply(`\`${error}\``)
    }

    let result: MathResult
    try {
      result = evaluate(input) as MathResult
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.startsWith('Undefined symbol')
      ) {
        // Attempt to simplify
        try {
          result = simplify(input)
        } catch (error_: unknown) {
          await handleError(error_)
          return
        }
      } else {
        await handleError(error)
        return
      }
    }
    await message.channel.send(
      result instanceof ResultSet
        ? result.entries.length === 1
          ? resultToString(result.entries[0] as MathResult)
          : result.entries.map(resultToString).join('\n')
        : resultToString(result),
      {code: true}
    )
  }
}
export default command
