import {Collection, Constants, MessageEmbed, escapeMarkdown} from 'discord.js'
import {emojis} from '../constants'
import {collection} from '../database'
import {shuffle} from '../lodash'
import {checkPermissions, resolveUser} from '../utils'
import {Difficulty, Type, fetchQuestion} from '../opentdb'
import type {EmbedFieldData} from 'discord.js'
import type {Db, Question} from '../database'
import type {Command, Message} from '../types'

/** Formats a percentage, with the percentage already calculated. */
const _formatPercentage = (
  numerator: number,
  denominator: number,
  percentage: number
): string => `${numerator}/${denominator} (${(percentage * 100).toFixed(2)}%)`

/** Formats a percentage. */
const formatPercentage = (numerator: number, denominator: number): string =>
  _formatPercentage(numerator, denominator, numerator / denominator)

const statsCommand = async (
  message: Message,
  input: string,
  database: Db
): Promise<void> => {
  if (message.guild && !(await checkPermissions(message, 'EMBED_LINKS'))) return
  const user = await resolveUser(message, input)
  if (!user) return

  const embed = new MessageEmbed()
    .setTitle(user.tag)
    .setThumbnail(user.displayAvatarURL())
    .setFooter(
      `Requested by ${message.author.tag}`,
      message.author.displayAvatarURL()
    )
    .setTimestamp()

  const questions =
    (await collection(database, 'users').findOne({_id: user.id}))
      ?.questionsAnswered ?? []
  if (questions.length) {
    /** Groups questions by a key and returns `[numberCorrect, total]`. */
    const reduceQuestions = <T extends keyof Question>(
      key: T
    ): Collection<Question[T], readonly [number, number]> =>
      questions.reduce((result, {[key]: _key, correct}) => {
        const [existingCorrect, total] = result.get(_key) ?? [0, 0]
        return result.set(_key, [
          existingCorrect + (correct === true ? 1 : 0),
          total + 1
        ])
      }, new Collection<Question[T], readonly [number, number]>())

    const categories = reduceQuestions('category')
      .mapValues(
        ([correct, total]) => [correct, total, correct / total] as const
      )
      .sorted(([, , a], [, , b]) => a - b)
    const bestCategory = categories.last()!
    const worstCategory = categories.first()!
    const categoriesMatching = ([, , percentage]: readonly [
      number,
      number,
      number
    ]): string =>
      categories
        .filter(([, , p]) => p === percentage)
        .keyArray()
        .join(', ')

    embed.addFields(
      {
        name: 'Correct answers (total)',
        value: formatPercentage(
          questions.filter(({correct}) => correct).length,
          questions.length
        ),
        inline: true
      },
      ...reduceQuestions('difficulty')
        .sorted((_, __, a, b) => a - b)
        .map(([correct, total], difficulty) => ({
          name: `Correct answers (${Difficulty[difficulty].toLowerCase()})`,
          value: formatPercentage(correct, total),
          inline: true
        })),
      {
        name: 'Best category',
        value: `${categoriesMatching(bestCategory)}: ${_formatPercentage(
          ...bestCategory
        )}`,
        inline: true
      },
      {
        name: 'Worst category',
        value: `${categoriesMatching(worstCategory)}: ${_formatPercentage(
          ...worstCategory
        )}`,
        inline: true
      }
    )
  } else
    embed.setDescription(`${user.tag} has not attempted any trivia questions!`)
  await message.channel.send(embed)
}

const leaderboardCommand = async (
  message: Message,
  database: Db
): Promise<void> => {
  if (!message.guild) {
    await message.sendDeletableMessage({
      reply: true,
      content: 'sorry, I can’t execute that command inside DMs. Noot noot.'
    })
    return
  }
  if (
    !(await checkPermissions(message, [
      'EMBED_LINKS',
      'READ_MESSAGE_HISTORY',
      'ADD_REACTIONS'
    ]))
  )
    return

  const usersCol = collection(database, 'users')
  const query = {
    _id: {$in: (await message.guild.members.fetch()).keyArray()},
    questionsAnswered: {$not: {$size: 0}}
  }
  const totalUsers = await usersCol.countDocuments(query)

  interface User {
    _id: string
    correct: number
    total: number
    percentage: number
  }
  const usersCache = new Map<number, readonly User[]>()
  const getUsers = async (skip: number): Promise<readonly User[]> => {
    const existing = usersCache.get(skip)
    if (existing) return existing
    const users = await usersCol
      .aggregate<User>([
        {$match: query},
        {
          $project: {
            correct: {
              $size: {
                $filter: {input: '$questionsAnswered', cond: '$$this.correct'}
              }
            },
            total: {$size: '$questionsAnswered'}
          }
        },
        {
          $project: {
            correct: 1,
            total: 1,
            percentage: {$divide: ['$correct', '$total']}
          }
        },
        {
          $sort: {
            percentage: -1,
            correct: -1
          }
        },
        {$skip: skip},
        {$limit: 10}
      ])
      .toArray()
    usersCache.set(skip, users)
    return users
  }

  collection(database, 'users').aggregate()

  const generateEmbed = async (skip: number): Promise<MessageEmbed> => {
    const users = await getUsers(skip)

    const embed = new MessageEmbed().setTitle(
      `Showing users ${skip + 1}-${skip + users.length} out of ${totalUsers}`
    )
    embed.addFields(
      await Promise.all(
        users.map(async ({_id, correct, total, percentage}, i) => ({
          name: `${i + skip + 1}. ${
            (await message.guild.members.fetch(_id)).user.tag
          }`,
          value: _formatPercentage(correct, total, percentage)
        }))
      )
    )
    return embed
  }

  const embedMessage = await message.channel.send(await generateEmbed(0))

  if (totalUsers <= 10) return
  await embedMessage.react(emojis.right)

  let currentIndex = 0

  const collector = embedMessage.createReactionCollector(
    ({emoji: {name}}, {id}) =>
      (name === emojis.left || name === emojis.right) &&
      id === message.author.id,
    {idle: 60_000}
  )

  collector.on('collect', async ({emoji: {name}}) => {
    let shouldReact = true
    await embedMessage.reactions.removeAll().catch((error: {code?: number}) => {
      if (error.code !== Constants.APIErrors.MISSING_PERMISSIONS)
        // TODO [@typescript-eslint/eslint-plugin@>3.8.0]: remove this comment
        // eslint-disable-next-line @typescript-eslint/no-throw-literal -- https://github.com/typescript-eslint/typescript-eslint/issues/2350
        throw error as Error
      shouldReact = false
    })
    currentIndex += name === emojis.left ? -10 : 10
    await embedMessage.edit(await generateEmbed(currentIndex))
    if (shouldReact as boolean) {
      if (currentIndex) await embedMessage.react(emojis.left)
      if (currentIndex + 10 < totalUsers) await embedMessage.react(emojis.right)
    }
  })
}

/** Formats a trivia answer. */
const format = (answer: string | boolean): string =>
  typeof answer === 'boolean' ? (answer ? 'True' : 'False') : answer

const command: Command = {
  name: 'trivia',
  aliases: ['t'],
  description: 'Asks a trivia question.',
  cooldown: 5,
  syntax: '9[s(tat(s))] [user]|l(eaderboard))',
  usage: `Using this command without any arguments will ask a trivia question.
\`s(tat(s)) [user]\`
Gets the trivia statistics for a user. If no user is specified, it will get the stats for yourself.

\`l(eaderboard)\`
Gets the leaderboard for this server.`,
  async execute(message, {input}, database) {
    // eslint-disable-next-line unicorn/no-unsafe-regex -- don't know how else to do it
    const match = /^s(?:tats?)?\s*/iu.exec(input)
    if (match) {
      await statsCommand(message, input.slice(match[0].length), database)
      return
    }

    if (/^l(?:eaderboard)?/iu.test(input)) {
      await leaderboardCommand(message, database)
      return
    }

    const {author, channel} = message
    if (
      message.guild &&
      !(await checkPermissions(message, ['EMBED_LINKS', 'ADD_REACTIONS']))
    )
      return

    const question = await fetchQuestion()
    if (!question) {
      await channel.send(
        'For some reason, no trivia questions could be fetched. Noot noot.'
      )
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
      fields: readonly EmbedFieldData[],
      _emojis: readonly string[],
      getSelectedAnswer: (emoji: string) => string | boolean,
      questionPrefix = ''
    ): Promise<void> => {
      const msg = (await channel.send({
        embed: {
          title: questionPrefix + escapeMarkdown(question.question),
          description: 'You have 15 seconds to answer.',
          fields: [
            ...fields,
            {
              name: 'Category',
              value: escapeMarkdown(question.category),
              inline: true
            },
            {
              name: 'Difficulty',
              value: Difficulty[question.difficulty],
              inline: true
            }
          ]
        }
      })) as Message

      // eslint-disable-next-line no-await-in-loop, no-restricted-syntax -- need to react individually
      for (const emoji of _emojis) await msg.react(emoji)

      const correctAnswer = format(question.correctAnswer)

      const collected = (
        await msg.awaitReactions(
          ({emoji}, {id}) => _emojis.includes(emoji.name) && id === author.id,
          {max: 1, time: 15_000}
        )
      ).first()
      let correct
      if (collected) {
        const selectedAnswer = getSelectedAnswer(collected.emoji.name)
        correct = selectedAnswer === question.correctAnswer

        await channel.send(
          correct
            ? `${emojis.tick} Congratulations, **${correctAnswer}** was the correct answer!`
            : `${emojis.cross} **${format(
                selectedAnswer
              )}** was incorrect. The correct answer was **${correctAnswer}**.`
        )
      } else {
        await channel.send(
          `Time’s up! The correct answer was **${correctAnswer}**.`
        )
      }

      await collection(database, 'users').updateOne(
        {_id: author.id},
        {
          $push: {
            questionsAnswered: {
              category: question.category,
              type: question.type,
              difficulty: question.difficulty,
              correct
            }
          }
        },
        {upsert: true}
      )
    }

    if (question.type === Type.TrueFalse) {
      await execute(
        [
          {name: emojis.tick, value: 'True'},
          {name: emojis.cross, value: 'False'}
        ],
        [emojis.tick, emojis.cross],
        emoji => emoji === emojis.tick,
        'True or false: '
      )
    } else {
      const answers = shuffle([
        ...question.incorrectAnswers,
        question.correctAnswer
      ])
      await execute(
        answers.map((a, i) => ({
          name: String.fromCharCode(i + 65),
          value: escapeMarkdown(a)
        })),
        emojis.letters,
        emoji => answers[(emojis.letters as readonly string[]).indexOf(emoji)]
      )
    }
  }
}

export default command
