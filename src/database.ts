import {defaultPrefix} from './constants'
import {MongoClient} from 'mongodb'
import type {Snowflake} from 'discord.js'
import type {Db as MongoDb, Collection, UpdateWriteOpResult} from 'mongodb'
import type {Difficulty, Type} from './opentdb'
import type {Guild as DiscordGuild} from './types'

interface Guild {
  _id: string
  prefix?: string
  volume?: number
}

// eslint-disable-next-line import/no-unused-modules -- imported as a type in trivia
export interface Question {
  category: string
  type: Type
  difficulty: Difficulty
  correct?: boolean
}

interface User {
  _id: string
  questionsAnswered: Question[]
}

interface Collections {
  guilds: Guild
  users: User
}

// eslint-disable-next-line import/no-unused-modules -- used in Command interface
export interface Db extends MongoDb {
  collection<T extends keyof Collections>(name: T): Collection<Collections[T]>
}

/** Gets a guild's entry in the database. */
export const getGuild = async (database: Db, guild: DiscordGuild | Snowflake): Promise<Guild | null> =>
  database.collection('guilds').findOne({_id: typeof guild === 'string' ? guild : guild.id})

/** Sets a value for a guild in a database. */
export const setGuildValue = async <T extends keyof Guild>(
  database: Db,
  guild: DiscordGuild,
  key: T,
  value: Guild[T]
): Promise<UpdateWriteOpResult> =>
  database.collection('guilds').updateOne({_id: guild.id}, {$set: {[key]: value}}, {upsert: true})

/** Gets the prefix for a guild. */
export const getPrefix = async (database: Db, guild: DiscordGuild | null): Promise<string> =>
  guild ? (await database.collection('guilds').findOne({_id: guild.id}))?.prefix ?? defaultPrefix : defaultPrefix

/** Connects to the database. */
export const connect = async (user: string, password: string, name: string): Promise<Db> =>
  (await new MongoClient(
    `mongodb+srv://${user}:${password}@comrade-pingu.vnvdt.mongodb.net/${name}?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true`
  ).connect()).db(name)
