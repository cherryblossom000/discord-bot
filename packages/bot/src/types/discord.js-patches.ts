import type * as D from 'discord.js'
import type {Client} from '../Client'

type WithClient<T> = T & {readonly client: Client}

export type Interaction<C extends D.CacheType = D.CacheType> = WithClient<
	D.Interaction<C>
>

export type InGuildCacheType = 'cached' | 'raw'

export type ChatInputInteraction<Cached extends D.CacheType = D.CacheType> =
	WithClient<D.ChatInputCommandInteraction<Cached>>
export type GuildChatInputInteraction = ChatInputInteraction<InGuildCacheType>

export type MessageContextMenuInteraction<C extends D.CacheType = D.CacheType> =
	WithClient<D.MessageContextMenuCommandInteraction<C>>
export type GuildMessageContextMenuInteraction =
	MessageContextMenuInteraction<InGuildCacheType>

export type UserContextMenuInteraction<C extends D.CacheType = D.CacheType> =
	WithClient<D.UserContextMenuCommandInteraction<C>>
export type GuildUserContextMenuInteraction =
	UserContextMenuInteraction<InGuildCacheType>

export type CommandInteraction<C extends D.CacheType = D.CacheType> =
	| ChatInputInteraction<C>
	| MessageContextMenuInteraction<C>
	| UserContextMenuInteraction<C>

export type GuildCommandInteraction = CommandInteraction<InGuildCacheType>
