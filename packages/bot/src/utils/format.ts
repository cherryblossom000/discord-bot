import {inlineCode} from '@discordjs/builders'
import * as DN from 'discord-api-types/v9'
import type * as DO from 'discord-api-types-old/v9'

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
  DN.ApplicationCommandOptionType | DO.ApplicationCommandOptionType,
  | DN.ApplicationCommandOptionType.Subcommand
  | DN.ApplicationCommandOptionType.SubcommandGroup
  | DO.ApplicationCommandOptionType.Subcommand
  | DO.ApplicationCommandOptionType.SubcommandGroup
>

// multiple versions of discord-api-types
// const optionsToString: Readonly<Record<OptionType, string>> = {
const optionsToString = {
  [DN.ApplicationCommandOptionType.String]: 'string',
  [DN.ApplicationCommandOptionType.Integer]: 'integer',
  [DN.ApplicationCommandOptionType.Boolean]: 'boolean',
  [DN.ApplicationCommandOptionType.User]: 'user',
  [DN.ApplicationCommandOptionType.Channel]: 'channel',
  [DN.ApplicationCommandOptionType.Role]: 'role',
  [DN.ApplicationCommandOptionType.Mentionable]: 'mentionable',
  [DN.ApplicationCommandOptionType.Number]: 'number'
}

export type FormatCommandInput = Pick<
  | DN.APIApplicationCommandSubCommandOptions
  | DO.APIApplicationCommandSubCommandOptions,
  'description' | 'name' | 'options'
>

/** Basically a normal (non-subcommand) command with argument options. */
export type FormatCommandSyntaxInput = Omit<FormatCommandInput, 'options'> & {
  options?: (
    | {
        type: OptionType
      } & (
        | DN.APIApplicationCommandArgumentOptions
        | DO.APIApplicationCommandArgumentOptions
      )
  )[]
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
                    optionsToString[type as OptionType]
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
