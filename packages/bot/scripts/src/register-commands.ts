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
  APIApplicationCommand,
  APIApplicationCommandOption,
  RESTGetAPICurrentUserGuildsResult,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
  RESTPutAPIApplicationGuildCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  Snowflake
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

const permissionsCommands = slashCommands.filter(
  (cmd): cmd is Required<Pick<SlashCommand, 'permissions'>> & SlashCommand =>
    !!cmd.permissions
)

const updatePermissions = async (
  apiCommands: readonly APIApplicationCommand[],
  guildId: Snowflake
): Promise<void> => {
  const idMap = new Map(apiCommands.map(({id, name}) => [name, id]))
  const body: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody =
    permissionsCommands.map(({data, permissions}) => ({
      id: idMap.get(data.name)!,
      permissions
    }))
  await request<RESTPutAPIGuildApplicationCommandsPermissionsJSONBody>(
    'put',
    Routes.guildApplicationCommandsPermissions(applicationId, guildId),
    body
  )
}

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
  ): T[] => commands.filter(({guildOnly = false}) => !guildOnly)
  const globalCmds = <T extends ContextMenuCommand | SlashCommand>(
    commands: readonly T[]
  ): T[] => commands.filter(({guildOnly = false}) => guildOnly)

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
          let commands: RESTPutAPIApplicationGuildCommandsResult
          try {
            commands = await request<
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
            ) {
              console.error(`Guild ${guild.id} missing applications.commands`)
              return
            }
            throw error
          }
          await updatePermissions(commands, guild.id)
        })
      )
    })
  ])
} else {
  const guildId = '541932275068174356'
  await updatePermissions(
    await request<
      RESTPutAPIApplicationCommandsJSONBody,
      RESTPutAPIApplicationCommandsResult
    >('put', Routes.applicationGuildCommands(applicationId, guildId), [
      ...slashCommandsToJSON(slashCommands),
      ...userCommandsToJSON(userCommands),
      ...messageCommandsToJSON(messageCommands)
    ]),
    guildId
  )
}
