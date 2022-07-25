import D, {Collection, type GuildMember, type Snowflake} from 'discord.js'
import type {Db} from './database.js'
import type {
	InteractionBase,
	MessageContextMenuCommand,
	SlashCommand,
	Trigger,
	UserContextMenuCommand
} from './types'

declare global {
	interface ArrayConstructor {
		isArray(arg: unknown): arg is readonly unknown[]
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

	/** Set the activity. */
	setActivity(): void {
		this.user!.setActivity(
			`capitalist scum in ${this.guilds.cache.size} servers`,
			{type: 'WATCHING'}
		)
	}
}
