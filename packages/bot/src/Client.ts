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

// eslint-disable-next-line import/no-unused-modules -- it is used
export interface ClientEvents extends D.ClientEvents {
  guildMemberAdd: [GuildMember]
  // Not using partials
  guildMemberRemove: [GuildMember]
  message: [Message]
}

// eslint-disable-next-line import/no-unused-modules -- it is used
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
  extends D.BaseManager<D.Snowflake, Guild, D.GuildResolvable> {
  create(...args: Parameters<D.GuildManager['create']>): Promise<Guild>
  fetch(id: D.Snowflake, cache?: boolean, force?: boolean): Promise<Guild>
}

/** The Discord client for this bot. */
export default class Client extends D.Client {
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

          async reply(content: OptionsWithSplit): Promise<this[]>
          async reply(
            options:
              | D.APIMessageContentResolvable
              | D.MessageAdditions
              | OptionsNoSplit
          ): Promise<this>
          async reply(
            content: D.StringResolvable,
            options: OptionsWithSplit
          ): Promise<this[]>
          async reply(
            content: D.StringResolvable,
            options: D.MessageAdditions | OptionsNoSplit
          ): Promise<this>
          async reply(...[content, options]: SendArgs): Promise<this[] | this>
          async reply(
            content: unknown,
            options?: D.MessageAdditions | D.MessageOptions
          ): Promise<this[] | this> {
            return (super.reply as (
              ...[_content, _options]: SendArgs
            ) => Promise<this[] | this>)(
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
              !(await checkPermissions((this as unknown) as GuildMessage, [
                'ADD_REACTIONS',
                'READ_MESSAGE_HISTORY'
              ]))
            )
              return
            const _content: Readonly<SendArgs> = Array.isArray(content)
              ? content
              : [content]
            const msg = await (reply
              ? this.reply(..._content)
              : this.channel.send(..._content))
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
