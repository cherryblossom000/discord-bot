import {DiscordAPIError, REST} from '@discordjs/rest'
import {
  ApplicationCommandType,
  RESTJSONErrorCodes,
  Routes
} from 'discord-api-types/v9'
import dotenv from 'dotenv'
import {messageCommands, slashCommands, userCommands} from './commands.js'
import type {RouteLike} from '@discordjs/rest'
import type {
  APIApplicationCommandOption,
  RESTGetAPICurrentUserGuildsResult,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
  RESTPutAPIApplicationGuildCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v9'
import type {ContextMenuCommand, SlashCommand} from '../../src/types'

dotenv.config()

const applicationId = process.env.APP_ID!
const rest = new REST({version: '9'}).setToken(process.env.TOKEN!)

const request = async <T, U = unknown>(
  method: 'delete' | 'get' | 'patch' | 'post' | 'put',
  route: RouteLike,
  ...[body]: T extends undefined ? [] : [body: T]
): Promise<U> => rest[method](route, {body}) as Promise<U>

const fetchGuilds = async (): Promise<RESTGetAPICurrentUserGuildsResult> =>
  // Returns 200 guilds for the first page, which is way way more than enough
  request<undefined, RESTGetAPICurrentUserGuildsResult>(
    'get',
    Routes.userGuilds()
  )

const slashCommandsToJSON = (
  commands: readonly SlashCommand[]
): RESTPostAPIChatInputApplicationCommandsJSONBody[] =>
  commands.map(
    ({data}) =>
      data.toJSON() as ReturnType<typeof data['toJSON']> & {
        options: APIApplicationCommandOption[]
      }
  )
const contextMenuCommandsToJSON =
  (type: ApplicationCommandType.Message | ApplicationCommandType.User) =>
  (
    commands: readonly ContextMenuCommand[]
  ): RESTPostAPIContextMenuApplicationCommandsJSONBody[] =>
    commands.map(({name}) => ({
      type,
      name,
      description: ''
    }))
const userCommandsToJSON = contextMenuCommandsToJSON(
  ApplicationCommandType.User
)
const messageCommandsToJSON = contextMenuCommandsToJSON(
  ApplicationCommandType.Message
)

if (process.env.NODE_ENV === 'production') {
  const guildCmds = <T extends ContextMenuCommand | SlashCommand>(
    commands: readonly T[]
  ): T[] => commands.filter(({guildOnly = false}) => guildOnly)
  const globalCmds = <T extends ContextMenuCommand | SlashCommand>(
    commands: readonly T[]
  ): T[] => commands.filter(({guildOnly = false}) => !guildOnly)

  await Promise.all([
    request<RESTPutAPIApplicationCommandsJSONBody>(
      'put',
      Routes.applicationCommands(applicationId),
      [
        ...slashCommandsToJSON(globalCmds(slashCommands)),
        ...userCommandsToJSON(globalCmds(userCommands)),
        ...messageCommandsToJSON(globalCmds(messageCommands))
      ]
    ),
    fetchGuilds().then(async guilds => {
      const body = [
        ...slashCommandsToJSON(guildCmds(slashCommands)),
        ...userCommandsToJSON(guildCmds(userCommands)),
        ...messageCommandsToJSON(guildCmds(messageCommands))
      ]
      await Promise.all(
        guilds.map(async guild => {
          try {
            await request<
              RESTPutAPIApplicationGuildCommandsJSONBody,
              RESTPutAPIApplicationGuildCommandsResult
            >(
              'put',
              Routes.applicationGuildCommands(applicationId, guild.id),
              body
            )
          } catch (error) {
            if (
              error instanceof DiscordAPIError &&
              error.code === RESTJSONErrorCodes.MissingAccess
            )
              console.error(`Guild ${guild.id} missing applications.commands`)
            else throw error
          }
        })
      )
    })
  ])
} else {
  const guildId = '541932275068174356'
  await request<
    RESTPutAPIApplicationCommandsJSONBody,
    RESTPutAPIApplicationCommandsResult
  >('put', Routes.applicationGuildCommands(applicationId, guildId), [
    ...slashCommandsToJSON(slashCommands),
    ...userCommandsToJSON(userCommands),
    ...messageCommandsToJSON(messageCommands)
  ])
}
