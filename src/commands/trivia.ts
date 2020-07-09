import {Collection, MessageEmbed} from 'discord.js'
import shuffle from 'lodash.shuffle'
import {emojis} from '../constants'
import {checkPermissions, resolveUser} from '../helpers'
import {Difficulty, Type, fetchQuestion} from '../opentdb'
import type {EmbedFieldData} from 'discord.js'
import type {Db, Question} from '../database'
import type {Command, Message} from '../types'

const statsCommand = async (message: Message, input: string, database: Db): Promise<void> => {
  if (message.guild && !await checkPermissions(message, 'EMBED_LINKS')) return
  const user = await resolveUser(message, input)
  if (!user) return

  const embed = new MessageEmbed()
    .setTitle(user.tag)
    .setThumbnail(user.displayAvatarURL())
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
    .setTimestamp()

  const questions = (await database.collection('users').findOne({_id: user.id}))?.questionsAnswered ?? []
  if (questions.length) {
    const _formatPercentage = (numerator: number, denominator: number, percentage: number): string =>
      `${numerator}/${denominator} (${(percentage * 100).toFixed(2)}%)`
    const formatPercentage = (a: number, b: number): string => _formatPercentage(a, b, a / b)

    const reduceQuestions = <T extends keyof Question>(
      key: T
    ): Collection<Question[T], readonly [number, number]> => questions
      .reduce((result, {[key]: _key, correct}) => {
        const [existingCorrect, total] = result.get(_key) ?? [0, 0]
        return result.set(_key, [existingCorrect + (correct === true ? 1 : 0), total + 1])
      }, new Collection<Question[T], readonly [number, number]>())

    const categories = reduceQuestions('category')
      .mapValues(([correct, total]) => [correct, total, correct / total] as const)
      .sorted(([,,a], [,,b]) => a - b)
    const bestCategory = categories.last()!
    const worstCategory = categories.first()!
    const categoriesMatching = ([,, percentage]: readonly [number, number, number]): string =>
      categories.filter(([,, p]) => p === percentage).keyArray().join(', ')

    embed.addFields(
      {
        name: 'Correct answers (total)',
        value: formatPercentage(questions.filter(({correct}) => correct).length, questions.length),
        inline: true
      },
      ...reduceQuestions('difficulty').map(([correct, total], difficulty) => ({
        name: `Correct answers (${Difficulty[difficulty].toLowerCase()})`,
        value: formatPercentage(correct, total),
        inline: true
      })),
      {
        name: 'Best category',
        value: `${categoriesMatching(bestCategory)}: ${_formatPercentage(...bestCategory)}`,
        inline: true
      },
      {
        name: 'Worst category',
        value: `${categoriesMatching(worstCategory)}: ${_formatPercentage(...worstCategory)}`,
        inline: true
      }
    )
  } else embed.setDescription(`${user.tag} has not attempted any trivia questions!`)
  await message.channel.send(embed)
}

const command: Command = {
  name: 'trivia',
  aliases: ['t'],
  description: 'Asks a trivia question.',
  cooldown: 5,
  syntax: '[s(tat(s))] [user]',
  usage: `Using this command without any arguments will ask a trivia question.
\`stats [user]\`
Gets the trivia statistics for a user. If no user is specified, it will get the stats for yourself.`,
  async execute(message, {input}, database) {
    const match = /^s(?:tats?)?\s*/ui.exec(input)
    if (match) {
      await statsCommand(message, input.slice(match[0].length), database)
      return
    }

    const {author, channel} = message
    if (message.guild && !await checkPermissions(message, ['EMBED_LINKS', 'ADD_REACTIONS'])) return

    const question = await fetchQuestion()
    if (!question) {
      await channel.send('For some reason, no trivia questions could be fetched. Noot noot.')
      return
    }

    /**
     * Asks the question and handles the response.
     * @param fields The embed fields representing the answers.
     * @param _emojis The emojis to react with.
     * @param getSelectedAnswer How to get the selected answer. This function takes the emoji as a parameter.
     * @param questionPrefix A prefix to put at the beginning of the question on the embed title.
     */
    const execute = async (
      fields: EmbedFieldData[],
      _emojis: readonly string[],
      getSelectedAnswer: (emoji: string) => string | boolean,
      questionPrefix = ''
    ): Promise<void> => {
      const msg = await channel.send({embed: {
        title: questionPrefix + question.question,
        description: 'You have 15 seconds to answer.',
        fields: [
          ...fields,
          {name: 'Category', value: question.category, inline: true},
          {name: 'Difficulty', value: Difficulty[question.difficulty], inline: true}
        ]
      }}) as Message

      // eslint-disable-next-line no-await-in-loop, no-restricted-syntax -- need to react individually
      for (const emoji of _emojis) await msg.react(emoji)

      const format = (answer: string | boolean): string => typeof answer === 'boolean' ? answer ? 'True' : 'False' : answer
      const correctAnswer = format(question.correctAnswer)

      const collected = (await msg.awaitReactions(
        ({emoji}, {id}) => _emojis.includes(emoji.name) && id === author.id,
        {max: 1, time: 15_000}
      )).first()
      let correct
      if (collected) {
        const selectedAnswer = getSelectedAnswer(collected.emoji.name)
        correct = selectedAnswer === question.correctAnswer

        await channel.send(correct
          ? `${emojis.tick} Congratulations, **${correctAnswer}** was the correct answer!`
          : `${emojis.cross} **${format(selectedAnswer)}** was incorrect. The correct answer was **${correctAnswer}**.`)
      } else await channel.send(`Time\u2019s up! The correct answer was **${correctAnswer}**.`)

      await database.collection('users').updateOne(
        {_id: author.id},
        {$push: {questionsAnswered: {
          category: question.category, type: question.type, difficulty: question.difficulty, correct
        }}},
        {upsert: true}
      )
    }

    if (question.type === Type.TrueFalse) {
      await execute(
        [{name: emojis.tick, value: 'True'}, {name: emojis.cross, value: 'False'}],
        [emojis.tick, emojis.cross],
        emoji => emoji === emojis.tick,
        'True or false: '
      )
    } else {
      const answers = shuffle([...question.incorrectAnswers, question.correctAnswer])
      await execute(
        answers.map((a, i) => ({name: String.fromCharCode(i + 65), value: a})),
        emojis.letters,
        emoji => answers[(emojis.letters as readonly string[]).indexOf(emoji)]
      )
    }
  }
}

export default command
