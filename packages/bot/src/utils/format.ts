import {inlineCode} from 'discord.js'
import * as D from 'discord.js'

export const upperFirst = (string: string): string =>
	string && string[0]!.toUpperCase() + string.slice(1)

export const screamingSnakeToStartCase = (string: string): string =>
	string.toLowerCase().split('_').map(upperFirst).join(' ')

export const pascalToStartCase = (string: string): string =>
	string.split(/(?=[A-Z\d])/u).join(' ')

export const splitMessage = (string: string, max = 2000): string[] => {
	const go = (
		lines: readonly string[],
		acc: readonly string[] = [],
		length = 0
	): string[] => {
		if (!lines.length) return [acc.join('\n')]
		const [head, ...tail] = lines as readonly [string, ...string[]]
		const newLength = length + head.length + 1
		return newLength > max
			? [acc.join('\n'), ...go(tail, [head], head.length)]
			: go(tail, [...acc, head], newLength)
	}
	return go(string.split('\n'))
}

export type DateFormatter = (date: Date) => string

export const createDateFormatter = (timeZone: string): DateFormatter => {
	const format = new Intl.DateTimeFormat('en-AU', {
		dateStyle: 'short',
		timeStyle: 'long',
		timeZone
	})
	return (date): string => {
		const parts = format.formatToParts(date)
		const part = (type: Intl.DateTimeFormatPartTypes): string | undefined =>
			parts.find(p => p.type === type)?.value
		return `${part('day')}/${part('month')}/${part('year')}, ${part(
			'hour'
		)}:${part('minute')} ${part('dayPeriod')!.toLowerCase()} ${
			part('timeZoneName') ?? 'GMT'
		}`
	}
}

export const formatBoolean = (boolean: boolean | null): string =>
	boolean ?? false ? 'Yes' : 'No'

const optionsToString: Readonly<
	Record<
		Exclude<
			D.ApplicationCommandOptionType,
			| D.ApplicationCommandOptionType.Subcommand
			| D.ApplicationCommandOptionType.SubcommandGroup
		>,
		string
	>
> = {
	[D.ApplicationCommandOptionType.String]: 'string',
	[D.ApplicationCommandOptionType.Integer]: 'integer',
	[D.ApplicationCommandOptionType.Boolean]: 'boolean',
	[D.ApplicationCommandOptionType.User]: 'user',
	[D.ApplicationCommandOptionType.Channel]: 'channel',
	[D.ApplicationCommandOptionType.Role]: 'role',
	[D.ApplicationCommandOptionType.Mentionable]: 'mentionable',
	[D.ApplicationCommandOptionType.Number]: 'number',
	[D.ApplicationCommandOptionType.Attachment]: 'attachment'
}

export type FormatCommandInput = Pick<
	D.APIApplicationCommand,
	'description' | 'name' | 'options'
>

/** Basically a normal (non-subcommand) command with argument options. */
export interface FormatCommandSyntaxInput extends FormatCommandInput {
	options: Exclude<D.APIApplicationCommandBasicOption, {autocomplete?: true}>[]
}

export const formatCommandSyntax = (
	{name, description, options = []}: FormatCommandSyntaxInput,
	{
		prefix,
		includeDescription = false,
		pipeChar = '|'
	}: {prefix?: string; includeDescription?: boolean; pipeChar?: string} = {}
): string => {
	const resolvedPrefix = prefix === undefined ? '' : `${prefix} `
	const commandString = `/${resolvedPrefix}${name}`
	const resolvedDescription = includeDescription ? `: ${description}` : ''
	return (
		inlineCode(
			commandString +
				(options.length
					? ` ${options
							.map(opt => {
								const {required = false} = opt
								/* eslint-disable unicorn/consistent-destructuring -- ts issue */
								return `${required ? '<' : '['}${opt.name}: ${
									'choices' in opt && opt.choices
										? opt.choices.map(choice => choice.name).join(pipeChar)
										: /* eslint-enable unicorn/consistent-destructuring */
										  optionsToString[opt.type]
								}${required ? '>' : ']'}`
							})
							.join(' ')}`
					: '')
		) + resolvedDescription
	)
}

export const formatCommandUsage = (
	usage: string | undefined,
	newline = '\n'
): string => (usage === undefined ? '' : newline + newline + usage)
