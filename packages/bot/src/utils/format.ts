import {inlineCode} from '@discordjs/builders'
import * as D from 'discord-api-types/v9'

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
  D.ApplicationCommandOptionType,
  | D.ApplicationCommandOptionType.Subcommand
  | D.ApplicationCommandOptionType.SubcommandGroup
>

// multiple versions of discord-api-types
// const optionsToString: Readonly<Record<OptionType, string>> = {
const optionsToString = {
  [D.ApplicationCommandOptionType.String]: 'string',
  [D.ApplicationCommandOptionType.Integer]: 'integer',
  [D.ApplicationCommandOptionType.Boolean]: 'boolean',
  [D.ApplicationCommandOptionType.User]: 'user',
  [D.ApplicationCommandOptionType.Channel]: 'channel',
  [D.ApplicationCommandOptionType.Role]: 'role',
  [D.ApplicationCommandOptionType.Mentionable]: 'mentionable',
  [D.ApplicationCommandOptionType.Number]: 'number'
}

export type FormatCommandInput = Pick<
  D.APIApplicationCommand,
  'description' | 'name' | 'options'
>

/** Basically a normal (non-subcommand) command with argument options. */
export interface FormatCommandSyntaxInput extends FormatCommandInput {
  options?: Extract<D.APIApplicationCommandStringOption, {choices?: unknown}>[]
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
