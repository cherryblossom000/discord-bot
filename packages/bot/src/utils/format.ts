import {inlineCode} from '@discordjs/builders'
import {ApplicationCommandOptionType} from 'discord-api-types/v9'
import type {
  APIApplicationCommandArgumentOptions,
  APIApplicationCommandSubCommandOptions
} from 'discord-api-types/v9'

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

type OptionType = Exclude<
  ApplicationCommandOptionType,
  | ApplicationCommandOptionType.Subcommand
  | ApplicationCommandOptionType.SubcommandGroup
>

const optionsToString: Readonly<Record<OptionType, string>> = {
  [ApplicationCommandOptionType.String]: 'string',
  [ApplicationCommandOptionType.Integer]: 'integer',
  [ApplicationCommandOptionType.Boolean]: 'boolean',
  [ApplicationCommandOptionType.User]: 'user',
  [ApplicationCommandOptionType.Channel]: 'channel',
  [ApplicationCommandOptionType.Role]: 'role',
  [ApplicationCommandOptionType.Mentionable]: 'mentionable',
  [ApplicationCommandOptionType.Number]: 'number'
}

export type FormatCommandInput = Pick<
  APIApplicationCommandSubCommandOptions,
  'description' | 'name' | 'options'
>

/** Basically a normal (non-subcommand) command with argument options. */
export type FormatCommandSyntaxInput = Omit<FormatCommandInput, 'options'> & {
  options?: (APIApplicationCommandArgumentOptions & {
    type: OptionType
  })[]
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
              .map(
                ({name: optName, required = false, type, choices}) =>
                  `${required ? '<' : '['}${optName}: ${
                    choices?.map(choice => choice.name).join(pipeChar) ??
                    optionsToString[type]
                  }${required ? '>' : ']'}`
              )
              .join(' ')}`
          : '')
    ) + resolvedDescription
  )
}

export const formatCommandUsage = (
  usage: string | undefined,
  newline = '\n'
): string => (usage === undefined ? '' : newline + newline + usage)
