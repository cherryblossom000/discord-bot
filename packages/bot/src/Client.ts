import D, {Collection, type GuildMember, type Snowflake} from 'discord.js'
import type {Db} from './database.js'
import type {
  InteractionBase,
  MessageContextMenuCommand,
  RotateAttachment,
  SlashCommand,
  Trigger,
  UserContextMenuCommand
} from './types'
import type {ReadonlyNonEmpty} from './utils'

declare global {
  interface ArrayConstructor {
    isArray(arg: unknown | readonly unknown[]): arg is readonly unknown[]
  }
}

export interface ClientEvents extends D.ClientEvents {
  // Not using partials
  guildMemberRemove: [GuildMember]
  interactionCreate: [InteractionBase]
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

/** The Discord client for this bot. */
export class Client extends D.Client {
  declare on: <K extends keyof ClientEvents>(
    event: K,
    listener: Listener<K>
  ) => this

  declare off: <K extends keyof ClientEvents>(
    event: K,
    listener: Listener<K>
  ) => this

  /** The slash commands. */
  readonly slashCommands = new Collection<string, SlashCommand>()

  /** The message context menu commands. */
  readonly messageCommands = new Collection<string, MessageContextMenuCommand>()

  /** The user context menu commands. */
  readonly userCommands = new Collection<string, UserContextMenuCommand>()

  /** The triggers. */
  readonly triggers = new Collection<RegExp, Trigger['message']>()

  /** The rejoining listeners, mapped by a guild's id. */
  readonly rejoinListeners = new Collection<Snowflake, RejoinListeners>()

  /**
   * The pending attachments of the messages that the Rotate Image command was
   * used on, mapped by the id of the user who requested it.
   */
  readonly rotateAttachments = new Collection<
    Snowflake,
    ReadonlyNonEmpty<RotateAttachment>
  >()

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(
      `capitalist scum in ${this.guilds.cache.size} servers`,
      {type: 'WATCHING'}
    )
  }
}
