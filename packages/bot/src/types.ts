import type {
	ContextMenuCommandBuilder,
	Message,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'
import type {
	GuildMessageContextMenuInteraction,
	GuildChatInputInteraction,
	GuildUserContextMenuInteraction,
	MessageContextMenuInteraction,
	ChatInputInteraction,
	UserContextMenuInteraction
} from './types/discord.js-patches'
import type {Db} from './database'

export * from './types/discord.js-patches'

interface CommandBase<I, D> {
	/** The actual command. */
	execute: (interaction: I, database: Db) => Promise<void>

	/** The data of the slash command for Discord. */
	data: D
}

interface SlashCommandBase<I extends ChatInputInteraction>
	extends CommandBase<
		I,
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandSubcommandsOnlyBuilder
	> {
	/** More docs. */
	usage?: string

	/**
	 * Whether or not the command is not shown in the docs.
	 * @default false
	 */
	hidden?: boolean
}

export type GuildOnlySlashCommand = SlashCommandBase<GuildChatInputInteraction>
export type AnySlashCommand = SlashCommandBase<ChatInputInteraction>
export type SlashCommand = AnySlashCommand | GuildOnlySlashCommand

type ContextMenuCommandBase<I> = CommandBase<I, ContextMenuCommandBuilder>

export type GuildOnlyMessageContextMenuCommand =
	ContextMenuCommandBase<GuildMessageContextMenuInteraction>
export type AnyMessageContextMenuCommand =
	ContextMenuCommandBase<MessageContextMenuInteraction>
export type MessageContextMenuCommand =
	| AnyMessageContextMenuCommand
	| GuildOnlyMessageContextMenuCommand

type GuildOnlyUserContextMenuCommand =
	ContextMenuCommandBase<GuildUserContextMenuInteraction>
export type AnyUserContextMenuCommand =
	ContextMenuCommandBase<UserContextMenuInteraction>
export type UserContextMenuCommand =
	| AnyUserContextMenuCommand
	| GuildOnlyUserContextMenuCommand

// TODO: figure out how to make ESLInt resolve @comrade-pingu/bot/dist/src/types
// to this file
// eslint-disable-next-line import/no-unused-modules -- is used in scripts
export type ContextMenuCommand =
	| MessageContextMenuCommand
	| UserContextMenuCommand

export type Command = ContextMenuCommand | SlashCommand

/** Something that is triggered based on a regular expression. */
export interface Trigger {
	/** The regex to test for. */
	regex: RegExp

	/** The message to reply with. Can be a function that returns the message.. */
	message: string | ((message: Message) => Promise<string> | string)
}
