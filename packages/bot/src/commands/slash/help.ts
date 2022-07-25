import {SlashCommandBuilder, inlineCode} from '@discordjs/builders'
import {
	ApplicationCommandOptionType,
	type APIApplicationCommandOption,
	type APIApplicationCommandSubcommandOption,
	type APIApplicationCommandSubcommandGroupOption,
	type RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v9'
import {
	commandFiles,
	formatCommandSyntax,
	formatCommandUsage,
	removeJSExtension,
	type FormatCommandSyntaxInput
} from '../../utils.js'
import type {EmbedFieldData, MessageEmbedOptions} from 'discord.js'
import type {AnySlashCommand} from '../../types'

const HELP = 'help'
const COMMAND = 'command'

const optionFields = (command: {
	options?: readonly APIApplicationCommandOption[]
}): EmbedFieldData[] | undefined =>
	command.options?.map(opt => ({
		name: opt.name,
		value: opt.description
	}))

const basicEmbed = (
	name: string,
	description: string,
	usage?: string
): MessageEmbedOptions => ({
	title: name,
	description: description + (usage === undefined ? '' : `\n${usage}`)
})

const subcommandEmbeds = (
	name: string,
	options: readonly APIApplicationCommandSubcommandOption[]
): MessageEmbedOptions[] =>
	options.map(subcommand => ({
		title: `${name} ${subcommand.name}`,
		description: formatCommandSyntax(subcommand as FormatCommandSyntaxInput, {
			prefix: name,
			includeDescription: true
		}),
		fields: optionFields(subcommand)
	}))

let allCommands: string | undefined

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName(HELP)
		.setDescription(
			'Lists all my commands or gets info about a specific command.'
		)
		.addStringOption(option =>
			option
				.setName(COMMAND)
				.setDescription(
					'The command that you want to get info about. If omitted, all the commands will be listed.'
				)
				.addChoices(
					...commandFiles.flatMap(filename => {
						const name = removeJSExtension(filename)
						return name === HELP ? [] : [{name, value: name}]
					})
				)
		),
	async execute(interaction) {
		const {
			client: {slashCommands}
		} = interaction

		const commandName = interaction.options.getString(COMMAND)

		// All commands
		if (commandName === null) {
			await interaction.reply({
				content: (allCommands ??= `Here’s a list of all my commands:
${slashCommands
	.filter(({hidden = false}) => !hidden)
	.sorted(({data: a}, {data: b}) => a.name.localeCompare(b.name))
	.map(({data: {name, description}}) => `\`${name}\`: ${description}`)
	.join('\n')}
You can send ${inlineCode(
					'/help [command name]'
				)} to get info on a specific command. Noot noot.`),
				ephemeral: true
			})
			return
		}

		// Specific command
		const {data, usage} = slashCommands.get(commandName)!
		// TODO: fix @discordjs/builders types
		const cmd = data.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody
		const {name, description, options} = cmd
		const embeds: MessageEmbedOptions[] =
			options?.[0]?.type === ApplicationCommandOptionType.SubcommandGroup
				? [
						basicEmbed(name, description, usage),
						...(
							options as APIApplicationCommandSubcommandGroupOption[]
						).flatMap(group => [
							basicEmbed(group.name, group.description),
							...subcommandEmbeds(group.name, group.options!)
						])
				  ]
				: options?.[0]?.type === ApplicationCommandOptionType.Subcommand
				? [
						basicEmbed(name, description, usage),
						...subcommandEmbeds(
							name,
							options as APIApplicationCommandSubcommandOption[]
						)
				  ]
				: [
						{
							title: name,
							description:
								formatCommandSyntax(cmd as FormatCommandSyntaxInput, {
									includeDescription: true
								}) + formatCommandUsage(usage),
							fields: optionFields(cmd)
						}
				  ]
		await interaction.reply({embeds: embeds.slice(0, 10), ephemeral: true})
		if (embeds.length > 10) {
			await Promise.all(
				Array.from({length: Math.ceil(embeds.length / 10) - 1}, async (_, i) =>
					interaction.followUp({
						embeds: embeds.slice(10 * (i + 1), 10 * (i + 2)),
						ephemeral: true
					})
				)
			)
		}
	}
}
export default command
