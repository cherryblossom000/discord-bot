import Discord, {Collection, Structures} from 'discord.js'
import upperFirst from 'lodash.upperfirst'
import {emojis} from './constants'
import {checkPermissions} from './utils'
import type {
  APIMessage,
  GuildMember,
  GuildResolvable,
  MessageAdditions,
  MessageOptions,
  MessageReaction,
  Snowflake,
  StringResolvable,
  User
} from 'discord.js'
import type {Db} from './database'
import type {
  Command,
  Guild,
  GuildMessage,
  Message,
  OptionsNoSplit,
  OptionsWithSplit,
  RegexCommand,
  Queue
} from './types'

// eslint-disable-next-line import/no-unused-modules -- it is used
export interface ClientEvents extends Discord.ClientEvents {
  guildMemberAdd: [GuildMember & {client: Client}]
  message: [Message]
}

export type Listener<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => void
// eslint-disable-next-line import/no-unused-modules -- it is used
export type EventListener<K extends keyof ClientEvents> = (
  client: Client,
  database: Db
) => Listener<K>

interface RejoinListeners {
  guildMemberAdd: Listener<'guildMemberAdd'>
  guildMemberRemove: Listener<'guildMemberRemove'>
}

interface GuildManager
  extends Discord.BaseManager<Snowflake, Guild, GuildResolvable> {
  create(...args: Parameters<Discord.GuildManager['create']>): Promise<Guild>
}

/** The Discord client for this bot. */
export default class Client extends Discord.Client {
  guilds!: GuildManager
  on!: <K extends keyof ClientEvents>(event: K, listener: Listener<K>) => this

  /** The commands. */
  readonly commands: Collection<string, Command<boolean>>

  /** The regex commands. */
  readonly regexCommands: Collection<RegExp, RegexCommand['regexMessage']>

  /** The music queue for each guild. */
  readonly queues: Collection<Snowflake, Queue>

  /** The about the rejoining listeners, mapped by a guild's ID. */
  readonly rejoinListeners: Collection<Snowflake, RejoinListeners>

  constructor(...args: ConstructorParameters<typeof Discord.Client>) {
    Structures.extend(
      'Message',
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Message is a class
      _Message =>
        class extends _Message {
          // TODO: Fix Discord.js' types of reply and send (1st overload) because it sues MessageAdditions twice in options param
          async reply(
            content?: StringResolvable,
            options?: MessageOptions | MessageAdditions | OptionsNoSplit
          ): Promise<this>
          async reply(
            content?: StringResolvable,
            options?: MessageAdditions | OptionsWithSplit
          ): Promise<this[]>
          async reply(
            options?:
              | APIMessage
              | MessageOptions
              | MessageAdditions
              | OptionsNoSplit
          ): Promise<this>
          async reply(
            options?: APIMessage | MessageAdditions | OptionsWithSplit
          ): Promise<this[]>
          async reply(
            content?: StringResolvable,
            options?: MessageOptions | MessageAdditions
          ): Promise<this | this[]> {
            return super.reply(
              this.guild
                ? content
                : Array.isArray(content)
                ? [upperFirst(content[0]), ...(content.slice(1) as unknown[])]
                : upperFirst(content),
              options
            ) as Promise<this | this[]>
          }

          async sendDeletableMessage({
            reply = false,
            content
          }: {
            reply?: boolean
            content:
              | MessageOptions
              | MessageAdditions
              | any
              | [any, (MessageOptions | MessageAdditions)?]
          }): Promise<void> {
            if (
              this.guild &&
              !(await checkPermissions((this as unknown) as GuildMessage, [
                'ADD_REACTIONS',
                'READ_MESSAGE_HISTORY'
              ]))
            )
              return
            const _content = (Array.isArray(content) ? content : [content]) as [
              any,
              (MessageOptions | MessageAdditions)?
            ]
            const msg = (await (reply
              ? this.reply(..._content)
              : this.channel.send(..._content))) as Message | Message[]
            await Promise.all(
              (Array.isArray(msg) ? msg : [msg]).map(async m => {
                await m.react(emojis.delete)
                await m.awaitReactions(
                  ({emoji}: MessageReaction, {id}: User) =>
                    emoji.name === emojis.delete && id === this.author.id,
                  {max: 1}
                )
                await m.delete()
              })
            )
          }
        }
    )
    super(...args)
    // These can't be stored properties otherwise I can't extend structures before calling super
    this.commands = new Collection<string, Command<boolean>>()
    this.regexCommands = new Collection<RegExp, RegexCommand['regexMessage']>()
    this.queues = new Collection<Snowflake, Queue>()
    this.rejoinListeners = new Collection<Snowflake, RejoinListeners>()
  }

  /*
   * the issue with voice
   * server UDP not sending IP info after IP discovery
   * working    : [0,12,39,49, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   * not working: [0,2, 11,198,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   */

  /** Set the activity. */
  async setActivity(): Promise<void> {
    await this.user!.setActivity(
      `capitalist scum in ${this.guilds.cache.size} servers`,
      {type: 'WATCHING'}
    )
  }
}
