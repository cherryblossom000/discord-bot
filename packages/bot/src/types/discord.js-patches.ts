import type * as D from 'discord.js'
import type * as DA from 'discord-api-types/v9'
import type Client from '../Client'

export type Snowflake = `${bigint}`

export interface User extends D.User {
  id: Snowflake
}

// #region Channel

/* eslint-disable @typescript-eslint/no-use-before-define -- circular */
interface MessageManager<T extends Message> extends D.MessageManager {
  fetch(message: Snowflake, options?: D.BaseFetchOptions): Promise<T>
  fetch(
    options?: D.ChannelLogsQueryOptions,
    cacheOptions?: D.BaseFetchOptions
  ): Promise<D.Collection<Snowflake, T>>
}

interface TextChannel extends D.TextChannel {
  messages: MessageManager<GuildMessage>
}

interface NewsChannel extends D.NewsChannel {
  messages: MessageManager<GuildMessage>
}

interface ThreadChannel extends D.ThreadChannel {
  messages: MessageManager<GuildMessage>
}

interface DMChannel extends D.DMChannel {
  messages: MessageManager<DMMessage>
}
/* eslint-enable @typescript-eslint/no-use-before-define -- circular */

/** Any text-based guild channel. */
export type TextBasedGuildChannel = NewsChannel | TextChannel | ThreadChannel
export type TextBasedChannel = DMChannel | TextBasedGuildChannel

export type Channel = D.StoreChannel | D.VoiceChannel | TextBasedChannel

// #endregion

export interface Guild extends D.Guild {
  id: Snowflake
  systemChannel: TextChannel | null
}

// #region Message

export interface BaseMessage extends D.Message {
  guild: Guild | null
}

/** A message from a guild. */
export interface GuildMessage extends BaseMessage {
  channel: TextBasedGuildChannel
  guild: Guild
  member: D.GuildMember
}

/** A message from a DM. */
interface DMMessage extends BaseMessage {
  channel: DMChannel
  guild: null
  member: null
}

export type Message = DMMessage | GuildMessage

// #endregion

// #region Commands

export interface APIMessage extends DA.APIMessage {
  id: Snowflake
}

export interface InteractionBase extends D.Interaction {
  readonly client: Client
  user: User
  inGuild(): this is this & {
    guildId: Snowflake
    member: NonNullable<D.Interaction['member']>
  }
  isCommand(): this is SlashCommandInteraction
  isContextMenu(): this is ContextMenuInteraction
}

type BaseCommandInteractionBase = D.BaseCommandInteraction & InteractionBase
interface BaseCommandInteraction extends BaseCommandInteractionBase {
  inGuild(): this is GuildSlashCommandInteraction & this
  followUp(
    options: D.InteractionReplyOptions | D.MessagePayload | string
  ): Promise<APIMessage | Message>
  reply(
    options: D.InteractionReplyOptions & {fetchReply: true}
  ): Promise<APIMessage | Message>
  reply(
    options: D.InteractionReplyOptions | D.MessagePayload | string
  ): Promise<void>
}

interface CommandInteractionOptionResolver
  extends D.CommandInteractionOptionResolver {
  getUser(name: string, required: true): User
  getUser(name: string, required?: boolean): User | null
}

// #region Slash Commands

type SlashCommandInteractionBaseBase = BaseCommandInteraction &
  D.CommandInteraction
interface SlashCommandInteractionBase extends SlashCommandInteractionBaseBase {
  options: CommandInteractionOptionResolver
  followUp(
    options: D.InteractionReplyOptions | D.MessagePayload | string
  ): Promise<APIMessage | Message>
  reply(
    options: D.InteractionReplyOptions & {fetchReply: true}
  ): Promise<APIMessage | Message>
  reply(
    options: D.InteractionReplyOptions | D.MessagePayload | string
  ): Promise<void>
}

interface DMSlashCommandInteraction extends SlashCommandInteractionBase {
  readonly guild: null
  guildId: null
  member: null
}

export interface GuildSlashCommandInteraction
  extends SlashCommandInteractionBase {
  guildId: Snowflake
  member: NonNullable<D.CommandInteraction['member']>
}

export type SlashCommandInteraction =
  | DMSlashCommandInteraction
  | GuildSlashCommandInteraction

// #endregion

// #region Context Menus

type ContextMenuInteractionBaseBase = BaseCommandInteraction &
  D.ContextMenuInteraction
export interface ContextMenuInteractionBase
  extends ContextMenuInteractionBaseBase {
  options: CommandInteractionOptionResolver
  inGuild(): this is GuildContextMenuInteraction & this
  followUp(
    options: D.InteractionReplyOptions | D.MessagePayload | string
  ): Promise<APIMessage | Message>
  reply(
    options: D.InteractionReplyOptions & {fetchReply: true}
  ): Promise<APIMessage | Message>
  reply(
    options: D.InteractionReplyOptions | D.MessagePayload | string
  ): Promise<void>
}

interface DMContextMenuInteraction extends ContextMenuInteractionBase {
  readonly guild: null
  guildId: null
  member: null
}

interface GuildContextMenuInteraction extends ContextMenuInteractionBase {
  guildId: Snowflake
  member: NonNullable<D.ContextMenuInteraction['member']>
}

export type ContextMenuInteraction =
  | DMContextMenuInteraction
  | GuildContextMenuInteraction

// #endregion

export type CommandInteraction =
  | ContextMenuInteraction
  | SlashCommandInteraction
export type GuildCommandInteraction =
  | GuildContextMenuInteraction
  | GuildSlashCommandInteraction

// #endregion
