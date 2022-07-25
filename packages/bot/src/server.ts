import {inlineCode} from '@discordjs/builders'
import Koa from 'koa'
import serve from 'koa-static'
import {Client, type ClientEvents, type EventListener} from './Client.js'
import {dev} from './constants.js'
import {connect, fetchRejoinGuilds} from './database.js'
import {
	commandFiles,
	handleError,
	importFolder as utilsImportFolder,
	type KeysMatching
} from './utils.js'
import * as rejoin from './utils/rejoin.js'
import type {AddressInfo} from 'node:net'
import type {Collection} from 'discord.js'
import type {
	Command,
	MessageContextMenuCommand,
	SlashCommand,
	Trigger,
	UserContextMenuCommand
} from './types'
import 'dotenv/config'

const assetsFolder = new URL('../assets/', import.meta.url)

// Routing
const app = new Koa()
app
	.use(async (ctx, next) => {
		const cleanedPath = ctx.path.replace(/^\/|\/$/gu, '')
		let redirected: string
		switch (cleanedPath) {
			case 'index':
			case 'index.html':
				redirected = '/'
				break
			case 'changelog.html':
				redirected = '/changelog'
				break
			case 'license.html':
				redirected = '/license'
				break
			default:
				return next()
		}
		ctx.status = 301
		ctx.redirect(redirected)
	})
	.use(serve(new URL('html/', assetsFolder).pathname, {extensions: ['html']}))
	.use(serve(new URL('css/', assetsFolder).pathname))
	.use(serve(new URL('img/', assetsFolder).pathname))

const client = new Client({
	allowedMentions: {parse: ['roles', 'users']},
	intents: [
		// Guild create (logging in, presence)
		'GUILDS',
		// Roles and nicknames changing, members leaving and joining (rejoin),
		// fetching of members for trivia leaderboard
		'GUILD_MEMBERS',
		// Emoji command
		'GUILD_EMOJIS_AND_STICKERS',
		// Guild reactions
		'GUILD_MESSAGE_REACTIONS',
		// Members joining voice channels
		'GUILD_VOICE_STATES',
		// Presences in profile
		'GUILD_PRESENCES',
		// Guild commands
		'GUILD_MESSAGES',
		// DM commands
		'DIRECT_MESSAGES',
		// DM reactions
		'DIRECT_MESSAGE_REACTIONS'
	]
})

// Handle promise rejections and uncaught exceptions
if (dev) {
	process.on('unhandledRejection', reason => {
		throw reason instanceof Error ? reason : new Error(`${reason}`)
	})
} else {
	process.on('unhandledRejection', reason =>
		handleError(
			client,
			reason instanceof Error ? reason : new Error(`${reason}`),
			'Uncaught promise rejection:'
		)
	)
	process.on('uncaughtException', error =>
		handleError(client, error, 'Uncaught exception:')
	)
}

// Connect to database
const database = await connect(
	process.env.DB_USER!,
	process.env.DB_PASSWORD!,
	process.env.DB_NAME!
)

const importFolder = async <T>(
	folderPath: string,
	fn: (mod: T, filename: string) => void,
	files?: readonly string[]
): Promise<void> => {
	try {
		for (const [filename, mod] of await utilsImportFolder<T>(
			import.meta.url,
			folderPath,
			files
		))
			fn(mod, filename)
	} catch (error) {
		handleError(
			client,
			error,
			`${inlineCode('importFolder')} failed with path ${inlineCode(
				folderPath
			)}.`
		)
	}
}

// Ready
client.once('ready', async () => {
	client.setActivity()

	// Initialise rejoin listeners
	// eslint-disable-next-line unicorn/no-array-for-each -- not array
	await fetchRejoinGuilds(database).forEach(({_id, rejoinFlags}) =>
		rejoin.addListeners(
			client,
			client.guilds.cache.get(_id)!,
			database,
			rejoinFlags
		)
	)

	console.log(`READY
  Users: ${client.users.cache.size}
  Channels: ${client.channels.cache.size}
  Guilds: ${client.guilds.cache.size}`)
})

const addCommand =
	<T extends Command>(
		collectionKey: KeysMatching<Client, Collection<string, T>>
	) =>
	(command: T): void => {
		;(client[collectionKey] as Collection<string, T>).set(
			command.data.name,
			command
		)
	}

// Initialise event listeners and commands
await Promise.all([
	importFolder<EventListener<keyof ClientEvents>>('events', (listener, name) =>
		client.on(name as keyof ClientEvents, listener(client, database))
	),
	importFolder<SlashCommand>(
		'commands/slash',
		addCommand('slashCommands'),
		commandFiles
	),
	importFolder<MessageContextMenuCommand>(
		'commands/message',
		addCommand('messageCommands')
	),
	importFolder<UserContextMenuCommand>(
		'commands/user',
		addCommand('userCommands')
	),
	importFolder<Trigger>('triggers', command =>
		client.triggers.set(command.regex, command.message)
	)
])

const listener = app.listen(Number(process.env.PORT), () => {
	if (dev)
		console.log(`http://localhost:${(listener.address() as AddressInfo).port}`)
})
await client.login()
