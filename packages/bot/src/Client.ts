import D, {Collection} from 'discord.js'
import type {Db} from './database.js'
import type {
  Channel,
  Command,
  Guild,
  GuildMember,
  Message,
  User,
  RegexCommand,
  Snowflake
} from './types'

declare global {
  interface ArrayConstructor {
    isArray(arg: unknown | readonly unknown[]): arg is readonly unknown[]
  }
}

export interface ClientEvents extends D.ClientEvents {
  guildMemberAdd: [GuildMember]
  // Not using partials
  guildMemberRemove: [GuildMember]
  messageCreate: [Message]
}

export type Listener<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => void
export type EventListener<K extends keyof ClientEvents> = (
  client: Client,
  database: Db
) => Listener<K>

interface RejoinListeners {
  guildMemberAdd: Listener<'guildMemberAdd'>
  guildMemberRemove: Listener<'guildMemberRemove'>
}

interface UserManager extends D.UserManager {
  readonly cache: Collection<string, User>
}

interface ChannelManager extends D.ChannelManager {
  fetch(...args: Parameters<D.ChannelManager['fetch']>): Promise<Channel>
}

interface GuildManager extends D.GuildManager {
  readonly cache: Collection<string, Guild>
  create(...args: Parameters<D.GuildManager['create']>): Promise<Guild>
  fetch(options: D.FetchGuildOptions | Snowflake): Promise<Guild>
  fetch(
    options?: D.FetchGuildsOptions
  ): Promise<Collection<Snowflake, D.OAuth2Guild>>
}

/** The Discord client for this bot. */
export default class Client extends D.Client {
  declare users: UserManager
  declare channels: ChannelManager
  declare guilds: GuildManager

  declare on: <K extends keyof ClientEvents>(
    event: K,
    listener: Listener<K>
  ) => this

  declare off: <K extends keyof ClientEvents>(
    event: K,
    listener: Listener<K>
  ) => this

  /** The commands. */
  readonly commands = new Collection<string, Command>()

  /** The regex commands. */
  readonly regexCommands = new Collection<
    RegExp,
    RegexCommand['regexMessage']
  >()

  /** The rejoining listeners, mapped by a guild's ID. */
  readonly rejoinListeners = new Collection<D.Snowflake, RejoinListeners>()

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(
      `capitalist scum in ${this.guilds.cache.size} servers`,
      {type: 'WATCHING'}
    )
  }
}
