import type * as D from 'discord.js'
import type {Client} from '../Client'

export interface InteractionBase<C extends D.CacheType = D.CacheType>
  extends D.Interaction<C> {
  readonly client: Client
}

export type SlashCommandInteraction<C extends D.CacheType = D.CacheType> =
  D.CommandInteraction<C> & InteractionBase<C>

export type GuildSlashCommandInteraction = SlashCommandInteraction<'present'>

export type MessageContextMenuInteraction<C extends D.CacheType = D.CacheType> =
  D.MessageContextMenuInteraction<C> & InteractionBase<C>

export type UserContextMenuInteraction<C extends D.CacheType = D.CacheType> =
  D.UserContextMenuInteraction<C> & InteractionBase<C>

export type CommandInteraction =
  | MessageContextMenuInteraction
  | SlashCommandInteraction
  | UserContextMenuInteraction
