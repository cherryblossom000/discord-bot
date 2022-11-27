import {
	ButtonBuilder,
	ButtonStyle,
	Collection,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder,
	bold,
	escapeMarkdown,
	type InteractionReplyOptions,
	type User
} from 'discord.js'
import {dev, emojis} from '../../constants.js'
import {
	addTriviaQuestion,
	aggregateTriviaUsers,
	collection,
	fetchValue,
	triviaUsersCount,
	triviaUsersCountQuery,
	type AggregatedTriviaUser,
	type Db,
	type Question
} from '../../database.js'
import {Difficulty, Type, fetchQuestion} from '../../opentdb.js'
import {
	BACK,
	backButton,
	backButtonDisabled,
	checkPermissions,
	fetchGuild,
	forwardButton,
	forwardButtonDisabled,
	handleError,
	replyAndFetch,
	replyDeletable,
	shuffle
} from '../../utils.js'
import type {AnySlashCommand, ChatInputInteraction} from '../../types'

const TRUE = 'true'
const FALSE = 'false'
const booleanButtons = [
	new ButtonBuilder({
		style: ButtonStyle.Success,
		customId: TRUE,
		label: 'True',
		emoji: emojis.tick
	}),
	new ButtonBuilder({
		style: ButtonStyle.Danger,
		customId: FALSE,
		label: 'False',
		emoji: emojis.cross
	})
]

/** Formats a trivia answer. */
const format = (answer: boolean | string): string =>
	typeof answer === 'boolean' ? (answer ? 'True' : 'False') : answer

const play = async (
	interaction: ChatInputInteraction,
	database: Db
): Promise<void> => {
	const {client, user} = interaction
	if (
		!(await checkPermissions(interaction, [
			'EmbedLinks',
			'ReadMessageHistory',
			'AddReactions'
		]))
	)
		return

	const question = await fetchQuestion()
	if (!question) {
		await interaction.reply(
			'For some reason, no trivia questions could be fetched. Please report this to my owner. Noot noot.'
		)
		return
	}

	/**
	 * Asks the question and handles the response.
	 * @param buttons The emojis to react with.
	 * @param getSelectedAnswer How to get the selected answer. This function takes the emoji as a parameter.
	 * @param questionPrefix A prefix to put at the beginning of the question on the embed title.
	 */
	const execute = async (
		buttons: readonly ButtonBuilder[],
		{
			getSelectedAnswer = (x): string => x,
			questionPrefix = ''
		}: {
			getSelectedAnswer?: (customId: string) => boolean | string
			questionPrefix?: string
		} = {}
	): Promise<void> => {
		const message = await replyAndFetch(interaction, {
			embeds: [
				{
					title: questionPrefix + escapeMarkdown(question.question),
					description: 'You have 15 seconds to answer.',
					fields: [
						{
							name: 'Category',
							value: escapeMarkdown(question.category),
							inline: true
						},
						{
							name: 'Difficulty',
							value: Difficulty[question.difficulty]!,
							inline: true
						}
					]
				}
			],
			components: [{type: ComponentType.ActionRow, components: [...buttons]}]
		})

		const correctAnswer = format(question.correctAnswer)
		if (dev) await interaction.followUp(correctAnswer)

		const collector =
			message.createMessageComponentCollector<ComponentType.Button>({
				time: 15_000
			})
		collector
			.on('collect', async buttonInteraction => {
				try {
					if (buttonInteraction.user.id !== user.id) {
						await buttonInteraction.reply({
							content: `This is ${user}’s question! Noot noot.`,
							ephemeral: true
						})
						return
					}

					collector.stop()

					const selectedAnswer = getSelectedAnswer(buttonInteraction.customId)
					const correct = selectedAnswer === question.correctAnswer

					await buttonInteraction.reply(
						correct
							? `${emojis.tick} Congratulations, ${bold(
									correctAnswer
							  )} was the correct answer!`
							: `${emojis.cross} ${bold(
									format(selectedAnswer)
							  )} was incorrect. The correct answer was ${bold(
									correctAnswer
							  )}.`
					)

					await addTriviaQuestion(database, user.id, question, correct)
				} catch (error) {
					handleError(client, error, 'trivia play: collect collector event', {
						to: interaction
					})
				}
			})
			.on('end', async (_, reason) => {
				try {
					if (reason === 'time') {
						await interaction.followUp(
							`${emojis.clock} Time’s up! The correct answer was ${bold(
								correctAnswer
							)}.`
						)
						await addTriviaQuestion(database, user.id, question, undefined)
					}
				} catch (error) {
					handleError(client, error, 'trivia play: end collector event', {
						to: interaction
					})
				}
			})
	}

	if (question.type === Type.TrueFalse) {
		await execute(booleanButtons, {
			getSelectedAnswer: customId => customId === TRUE,
			questionPrefix: 'True or false: '
		})
	} else {
		const answers = shuffle([
			...question.incorrectAnswers,
			question.correctAnswer
		])
		await execute(
			answers.map(
				answer =>
					new ButtonBuilder({
						style: ButtonStyle.Secondary,
						customId: answer,
						label: escapeMarkdown(answer)
					})
			)
		)
	}
}

/** Formats a percentage, with the percentage already calculated. */
const formatPercentage = (
	numerator: number,
	denominator: number,
	percentage: number = numerator / denominator
): string => `${numerator}/${denominator} (${(percentage * 100).toFixed(2)}%)`

const stats = async (
	interaction: ChatInputInteraction,
	user: User,
	database: Db
): Promise<void> => {
	if (!(await checkPermissions(interaction, ['EmbedLinks']))) return

	const embed = new EmbedBuilder()
		.setTitle(user.tag)
		.setThumbnail(user.displayAvatarURL())
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL()
		})
		.setTimestamp()

	const questions =
		(await fetchValue(database, 'users', user.id, 'questionsAnswered')) ?? []
	if (questions.length) {
		/** Groups questions by a key and returns `[numberCorrect, total]`. */
		const reduceQuestions = <T extends keyof Question>(
			key: T
		): Collection<Question[T], readonly [number, number]> =>
			questions.reduce((result, {[key]: value, correct}) => {
				const [existingCorrect, total] = result.get(value) ?? [0, 0]
				return result.set(value, [
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
			[...categories.filter(([, , p]) => p === percentage).keys()].join(', ')

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
					name: `Correct answers (${Difficulty[difficulty]!.toLowerCase()})`,
					value: formatPercentage(correct, total),
					inline: true
				})),
			{
				name: 'Best category',
				value: `${categoriesMatching(bestCategory)}: ${formatPercentage(
					...bestCategory
				)}`,
				inline: true
			},
			{
				name: 'Worst category',
				value: `${categoriesMatching(worstCategory)}: ${formatPercentage(
					...worstCategory
				)}`,
				inline: true
			}
		)
	} else
		embed.setDescription(`${user.tag} has not attempted any trivia questions!`)
	await interaction.reply({embeds: [embed]})
}

const leaderboard = async (
	interaction: ChatInputInteraction,
	database: Db
): Promise<void> => {
	// TODO: register a trivia command for DMs and one for guilds
	if (!interaction.inGuild()) {
		await replyDeletable(
			interaction,
			'sorry, I can’t execute that command inside DMs. Noot noot.'
		)
		return
	}
	if (
		!(await checkPermissions(interaction, [
			'EmbedLinks',
			'ReadMessageHistory',
			'AddReactions'
		]))
	)
		return

	const guild = await fetchGuild(interaction)

	const usersCol = collection(database, 'users')
	const query = await triviaUsersCountQuery(guild)
	const totalUsers = await triviaUsersCount(usersCol, query)

	const usersCache = new Map<number, readonly AggregatedTriviaUser[]>()
	const getUsers = async (
		skip: number
	): Promise<readonly AggregatedTriviaUser[]> => {
		const existing = usersCache.get(skip)
		if (existing) return existing
		const users = await aggregateTriviaUsers(usersCol, query, skip)
		usersCache.set(skip, users)
		return users
	}

	const messageOptions = async (
		start: number
	): Promise<Pick<InteractionReplyOptions, 'components' | 'embeds'>> => {
		const users = await getUsers(start)
		return {
			embeds: [
				{
					title: `Showing users ${start + 1}-${
						start + users.length
					} out of ${totalUsers}`,
					fields: await Promise.all(
						users.map(async ({_id: id, correct, total, percentage}, i) => ({
							name: `${i + start + 1}. ${
								(
									await guild.members.fetch(id)
								).user.tag
							}`,
							value: formatPercentage(correct, total, percentage)
						}))
					)
				}
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						start ? backButton : backButtonDisabled,
						start + 10 < totalUsers ? forwardButton : forwardButtonDisabled
					]
				}
			]
		}
	}

	const canFitOnOnePage = totalUsers <= 10
	const embedMessage = await replyAndFetch(interaction, await messageOptions(0))
	if (canFitOnOnePage) return

	const collector =
		embedMessage.createMessageComponentCollector<ComponentType.Button>()

	let currentIndex = 0
	collector.on('collect', async buttonInteraction => {
		try {
			if (buttonInteraction.user.id !== interaction.user.id) {
				await buttonInteraction.reply({
					content: `Only ${interaction.user} can do this! Noot noot.`,
					ephemeral: true
				})
				return
			}

			buttonInteraction.customId === BACK
				? (currentIndex -= 10)
				: (currentIndex += 10)
			await buttonInteraction.update(await messageOptions(currentIndex))
		} catch (error) {
			handleError(
				interaction.client,
				error,
				'trivia leaderboard: collect collector event',
				{to: interaction}
			)
		}
	})
}

const PLAY = 'play'
const STATS = 'stats'
const USER = 'user'
const LEADERBOARD = 'leaderboard'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('Trivia from https://opentdb.com!')
		.addSubcommand(subcommand =>
			subcommand.setName(PLAY).setDescription('Ask a trivia question.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName(STATS)
				.setDescription('Gets the trivia statistics for a user.')
				.addUserOption(option =>
					option
						.setName(USER)
						.setDescription(
							'The user to get the stats for, defaulting to yourself.'
						)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName(LEADERBOARD)
				.setDescription('Gets the trivia leaderboard for this server.')
		),
	async execute(interaction, database) {
		switch (interaction.options.getSubcommand(true)) {
			case PLAY:
				await play(interaction, database)
				break
			case STATS:
				await stats(
					interaction,
					interaction.options.getUser(USER) ?? interaction.user,
					database
				)
				break
			case LEADERBOARD:
				await leaderboard(interaction, database)
		}
	}
}

export default command
