import {defaultPrefix} from './constants'
import {MongoClient} from 'mongodb'
import {Snowflake} from 'discord.js'
import type {
  Db as MongoDb,
  Collection as MongoCollection,
  UpdateWriteOpResult
} from 'mongodb'
import type {Difficulty, Type} from './opentdb'
import type {Guild as DiscordGuild} from './types'

export const enum MemberRejoinFlags {
  Roles = 1,
  Nickname,
  All = Roles | Nickname
}

interface Member {
  _id: string
  roles?: string[]
  nickname?: string | null
}

interface Guild {
  _id: string
  prefix?: string
  volume?: number
  rejoinFlags?: MemberRejoinFlags
  members?: Member[]
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

/** A collection for this client. */
// eslint-disable-next-line import/no-unused-modules -- it is used
export type Collection<K extends keyof Collections> = MongoCollection<
  Collections[K]
>

export interface Db extends MongoDb {
  collection<K extends keyof Collections>(name: K): Collection<K>
}

type CacheEntry = {[K in keyof Collections]?: Collection<K>}
const collectionCache = new WeakMap<Db, CacheEntry>()
/** Db#collection with caching. */
export const collection = <K extends keyof Collections>(
  database: Db,
  name: K
): Collection<K> => {
  const cached = collectionCache.get(database) ?? {}
  const existing = cached[name] as Collection<K> | undefined
  if (existing) return existing
  const col = database.collection(name)
  cached[name] = col as CacheEntry[K]
  collectionCache.set(database, cached)
  return col
}

/** Gets a guild's entry in the database. */
export const getGuild = async (
  database: Db,
  guild: DiscordGuild | Snowflake
): Promise<Guild | null> =>
  collection(database, 'guilds').findOne({
    _id: typeof guild === 'string' ? guild : guild.id
  })

/** Sets a value for a guild in a database. */
export const setGuildValue = async <T extends keyof Guild>(
  database: Db,
  guild: DiscordGuild,
  key: T,
  value: Guild[T]
): Promise<UpdateWriteOpResult> =>
  collection(database, 'guilds').updateOne(
    {_id: guild.id},
    {$set: {[key]: value}},
    {upsert: true}
  )

/** Gets the prefix for a guild. */
export const getPrefix = async (
  database: Db,
  guild: DiscordGuild | null
): Promise<string> =>
  guild
    ? (await collection(database, 'guilds').findOne({_id: guild.id}))?.prefix ??
      defaultPrefix
    : defaultPrefix

/** Connects to the database. */
export const connect = async (
  user: string,
  password: string,
  name: string
): Promise<Db> =>
  (
    await new MongoClient(
      `mongodb+srv://${user}:${password}@comrade-pingu.vnvdt.mongodb.net/${name}?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true`
    ).connect()
  ).db(name)
