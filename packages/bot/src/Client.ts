import D, {
  Collection,
  MessageAttachment,
  MessageEmbed,
  Util,
  Structures
} from 'discord.js'
import {emojis} from './constants'
import {upperFirst} from './lodash'
import {checkPermissions} from './utils'
import type {Db} from './database'
import type {
  BaseMessage,
  Channel,
  Command,
  Guild,
  GuildMessage,
  GuildMember,
  Message,
  SendArgs,
  OptionsNoSplit,
  OptionsWithSplit,
  RegexCommand,
  Queue,
  TextBasedChannel
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
  message: [Message]
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

interface ChannelManager
  extends D.BaseManager<D.Snowflake, Channel, D.ChannelResolvable> {
  fetch(...args: Parameters<D.ChannelManager['fetch']>): Promise<Channel>
}

interface GuildManager
  extends D.BaseManager<D.Snowflake, Guild, D.GuildResolvable> {
  create(...args: Parameters<D.GuildManager['create']>): Promise<Guild>
  fetch(...args: Parameters<D.GuildManager['fetch']>): Promise<Guild>
}

/** The Discord client for this bot. */
export default class Client extends D.Client {
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
  readonly commands: Collection<string, Command>

  /** The regex commands. */
  readonly regexCommands: Collection<RegExp, RegexCommand['regexMessage']>

  /** The music queue for each guild. */
  readonly queues: Collection<D.Snowflake, Queue>

  /** The rejoining listeners, mapped by a guild's ID. */
  readonly rejoinListeners: Collection<D.Snowflake, RejoinListeners>

  constructor(...args: ConstructorParameters<typeof D.Client>) {
    Structures.extend(
      'Message',
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Message is a class
      _Message =>
        class extends _Message implements BaseMessage {
          declare client: Client
          declare channel: TextBasedChannel
          declare guild: Guild | null

          override async reply(content: OptionsWithSplit): Promise<this[]>
          override async reply(
            options:
              | D.APIMessageContentResolvable
              | D.MessageAdditions
              | OptionsNoSplit
          ): Promise<this>
          override async reply(
            content: D.StringResolvable,
            options: OptionsWithSplit
          ): Promise<this[]>
          override async reply(
            content: D.StringResolvable,
            options: D.MessageAdditions | OptionsNoSplit
          ): Promise<this>
          override async reply(
            ...[content, options]: SendArgs
          ): Promise<this[] | this>
          override async reply(
            content: unknown,
            options?: D.MessageAdditions | D.MessageOptions
          ): Promise<this[] | this> {
            return (
              super.reply as (
                ...[_content, _options]: SendArgs
              ) => Promise<this[] | this>
            )(
              ...(this.guild
                ? ([content, options] as Readonly<SendArgs>)
                : Array.isArray(content) &&
                  content.length &&
                  !content.some(
                    x =>
                      x instanceof MessageEmbed ||
                      x instanceof MessageAttachment
                  )
                ? [
                    [
                      upperFirst(Util.resolveString(content[0])),
                      ...(content.slice(1) as readonly unknown[])
                    ],
                    options
                  ]
                : typeof content == 'object' && content && !options
                ? [content as D.APIMessage | D.MessageAdditions]
                : [upperFirst(Util.resolveString(content)), options])
            )
          }

          async sendDeletableMessage({
            reply = false,
            content
          }: {
            reply?: boolean
            content:
              | D.MessageOptions
              | MessageAttachment
              | MessageEmbed
              | string
              | readonly [
                  string | readonly string[],
                  (D.MessageAdditions | D.MessageOptions)?
                ]
          }): Promise<void> {
            if (
              this.guild &&
              !(await checkPermissions(this as unknown as GuildMessage, [
                'ADD_REACTIONS',
                'READ_MESSAGE_HISTORY'
              ]))
            )
              return
            const contentArgs: Readonly<SendArgs> = Array.isArray(content)
              ? content
              : [content]
            const msg = await (reply
              ? this.reply(...contentArgs)
              : this.channel.send(...contentArgs))
            await Promise.all(
              (Array.isArray(msg) ? msg : [msg]).map(async m => {
                await m.react(emojis.delete)
                await m.awaitReactions(
                  ({emoji}: D.MessageReaction, {id}: D.User) =>
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
    this.commands = new Collection()
    this.regexCommands = new Collection()
    this.queues = new Collection()
    this.rejoinListeners = new Collection()
  }

  /** Set the activity. */
  async setActivity(): Promise<void> {
    await this.user!.setActivity(
      `capitalist scum in ${this.guilds.cache.size} servers`,
      {type: 'WATCHING'}
    )
  }
}
