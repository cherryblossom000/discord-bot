import {inspect} from 'node:util'
import Discord, {SlashCommandBuilder, codeBlock, inlineCode} from 'discord.js'
import {emojis, me} from '../../constants.js'
import {replyDeletable, splitMessage} from '../../utils.js'
import type {AnySlashCommand} from '../../types'

declare global {
	interface AsyncFunction extends Function {
		(...args: readonly unknown[]): Promise<unknown>
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- circular
		readonly constructor: AsyncFunctionConstructor
		readonly [Symbol.toStringTag]: string
	}

	interface AsyncFunctionConstructor extends FunctionConstructor {
		(...args: readonly string[]): AsyncFunction
		readonly prototype: AsyncFunction
		new (...args: readonly string[]): AsyncFunction
	}
}

// class, using it to get AsyncFunction
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-empty-function -- AsyncFunction
const AsyncFunction = (async (): Promise<void> => {})
	.constructor as AsyncFunctionConstructor

const JAVASCRIPT = 'javascript'
const HIDE_RESULT = 'hide-result'
const EPHEMERAL = 'ephemeral'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluates some JS.')
		.addStringOption(option =>
			option
				.setName(JAVASCRIPT)
				.setRequired(true)
				.setDescription('The code to execute.')
		)
		.addBooleanOption(option =>
			option
				.setName(HIDE_RESULT)
				.setDescription(
					'Prevent me from sending the result. Defaults to False.'
				)
		)
		.addBooleanOption(option =>
			option
				.setName(EPHEMERAL)
				.setDescription(
					'Whether or not to send the reply as an ephemeral one. Defaults to False.'
				)
		),
	hidden: true,
	usage: `The following variables are available:
- ${inlineCode(
		'interaction: Discord.Interaction'
	)}: The slash command interaction you sent.
- ${inlineCode('database: Db')}: The database.
- ${inlineCode('Discord: Discord')}: The Discord.js module.`,
	async execute(interaction, database) {
		if (interaction.user.id !== me) {
			await interaction.reply({
				content: 'This command can only be done by the bot owner!',
				ephemeral: true
			})
			return
		}

		const ephemeral = interaction.options.getBoolean(EPHEMERAL) ?? false

		let result
		try {
			result = await AsyncFunction(
				'interaction',
				'database',
				'Discord',
				`return (${interaction.options.getString(JAVASCRIPT, true)})`
			)(interaction, database, Discord)
		} catch (error) {
			await replyDeletable(interaction, {
				content: codeBlock(`${error}`),
				ephemeral
			})
			return
		}

		if (interaction.options.getBoolean(HIDE_RESULT) ?? false) {
			await interaction.reply({content: emojis.thumbsUp, ephemeral: true})
			return
		}

		for (const [i, text] of splitMessage(
			['DISCORD_TOKEN', 'DB_USER', 'DB_PASSWORD', 'REPLIT_DB_URL'].reduce(
				(acc, key) => {
					const value = process.env[key]
					return value === undefined ? acc : acc.replaceAll(value, `<${key}>`)
				},
				inspect(result)
			),
			// '```js\n'.length + '\n```'.length === 10
			1990
		).entries()) {
			/* eslint-disable-next-line no-await-in-loop -- There's been issues with
			 * the follow-up messages attempting to send before Discord.js knows that
			 * there's been a follow-up */
			await replyDeletable(
				interaction,
				{
					content: codeBlock('js', text),
					ephemeral
				},
				i !== 0
			)
		}
	}
}
export default command
