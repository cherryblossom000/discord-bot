import {MongoClient} from 'mongodb'
import {defaultPrefix, defaultTimeZone} from './constants'
import type {Snowflake, User as DiscordUser} from 'discord.js'
import type {
  Collection as MongoCollection,
  Document,
  Db as MongoDb,
  Filter,
  FindCursor,
  FindOptions,
  MatchKeysAndValues,
  UpdateFilter,
  UpdateOptions,
  UpdateResult
} from 'mongodb'
import type {Difficulty, Type, Question as TriviaQuestion} from './opentdb'
import type * as Discord from './types'

type Override<T, U> = Omit<T, keyof U> & U

// #region Models

export const enum MemberRejoinFlags {
  Roles = 1,
  Nickname,
  All = Roles | Nickname
}

interface Member {
  _id: Snowflake
  roles?: readonly Snowflake[]
  nickname?: string | null
}

// eslint-disable-next-line import/no-unused-modules -- it is used
export interface Guild {
  _id: Snowflake
  prefix?: string
  volume?: number
  rejoinFlags?: MemberRejoinFlags
  members?: readonly Member[]
}

export interface Question {
  category: string
  type: Type
  difficulty: Difficulty
  correct?: boolean
}

interface User {
  _id: string
  questionsAnswered?: readonly Question[]
  timeZone?: string
}

// #endregion

// #region Collection

/** A mapping of collection names to `[databaseType, discordType]`. */
interface Collections {
  guilds: [Guild, Discord.Guild]
  users: [User, DiscordUser]
}

type CollectionsKeys = keyof Collections
type DatabaseType<C extends CollectionsKeys> = Collections[C][0]
type DiscordType<C extends CollectionsKeys> = Collections[C][1]

/** A collection for this client. */
type Collection<C extends CollectionsKeys> = C extends unknown
  ? MongoCollection<DatabaseType<C>>
  : never

type AnyCollection = Collection<CollectionsKeys>

export type Db = Override<
  MongoDb,
  {
    collection<C extends CollectionsKeys>(name: C): Collection<C>
  }
>

type CollectionsCacheEntry = Override<
  Map<CollectionsKeys, AnyCollection>,
  {
    forEach(
      callbackfn: <C extends CollectionsKeys>(
        value: Collection<C>,
        key: C,
        map: CollectionsCacheEntry
      ) => void,
      thisArg?: unknown
    ): void
    get<C extends CollectionsKeys>(key: C): Collection<C> | undefined
    set<C extends CollectionsKeys>(
      key: C,
      value: Collection<C>
    ): CollectionsCacheEntry
    [Symbol.iterator](): IterableIterator<
      {[C in CollectionsKeys]: [C, Collection<C>]}[CollectionsKeys]
    >
  }
>

const collectionCache = new WeakMap<Db, CollectionsCacheEntry>()
/** `Db#collection` with caching. */
export const collection = <C extends CollectionsKeys>(
  database: Db,
  name: C
): Collection<C> => {
  const cache =
    collectionCache.get(database) ??
    ((): CollectionsCacheEntry => {
      const newCache: CollectionsCacheEntry = new Map()
      collectionCache.set(database, newCache)
      return newCache
    })()
  const newCollection = database.collection(name)
  cache.set(name, newCollection)
  return newCollection
}

// #endregion

// #region Documents Cache

const resolveID = (id: DiscordType<CollectionsKeys> | string): string =>
  typeof id == 'string' ? id : id.id

type Cached<C extends CollectionsKeys> = Omit<DatabaseType<C>, '_id'>

type DocumentsCache = Override<
  WeakMap<AnyCollection, Map<string, Cached<CollectionsKeys>>>,
  {
    get<C extends CollectionsKeys>(
      key: Collection<C>
    ): Map<string, Cached<C>> | undefined
    set<C extends CollectionsKeys>(
      key: Collection<C>,
      value: Map<string, Cached<C>>
    ): DocumentsCache
  }
>

const documentsCache = new WeakMap() as DocumentsCache

const getCache = <C extends CollectionsKeys>(
  col: Collection<C>
): Map<string, Cached<C>> => {
  const existingCache = documentsCache.get(col)
  if (existingCache) return existingCache
  const newCache = new Map<string, Cached<C>>()
  documentsCache.set(col, newCache)
  return newCache
}

const updateCache = <C extends CollectionsKeys>(
  col: Collection<C>,
  id: DiscordType<C> | string,
  value: Cached<C> | ((cached?: Cached<C>) => Cached<C> | undefined)
): void => {
  const cache = getCache(col)
  const resolvedID = resolveID(id)
  const result =
    typeof value == 'function' ? value(cache.get(resolvedID)) : value
  result ? cache.set(resolvedID, result) : cache.delete(resolvedID)
}

// #endregion

// #region Low Level Utils

type FindOneResult<C extends CollectionsKeys, K extends keyof Cached<C>> = Pick<
  DatabaseType<C>,
  K | '_id'
>

const findOne =
  <C extends CollectionsKeys>(col: Collection<C>) =>
  async <K extends keyof Cached<C>>(
    id: DiscordType<C> | string,
    keys: readonly K[],
    filter?: Omit<Filter<DatabaseType<C>>, '_id'>,
    options?: Omit<FindOptions<DatabaseType<C>>, 'projection'>
  ): Promise<FindOneResult<C, K> | undefined> => {
    const _id = resolveID(id)
    const cache = getCache(col)
    const cached = cache.get(_id)
    const cachedKeys = cached ? Object.keys(cached) : []
    const keysToFetch = keys.filter(
      key => !(cachedKeys as readonly PropertyKey[]).includes(key)
    )
    if (!keysToFetch.length) return cached as FindOneResult<C, K> | undefined

    const result = await (
      col as {
        findOne<U = DatabaseType<C>>(
          filter: Filter<DatabaseType<C>>,
          options?: FindOptions<U extends DatabaseType<C> ? DatabaseType<C> : U>
        ): Promise<U | null>
      }
    ).findOne(
      {...filter, _id} as Filter<DatabaseType<C>>,
      {
        ...options,
        projection: Object.fromEntries(keysToFetch.map(key => [key, 1]))
      } as FindOptions<
        FindOneResult<C, K> extends DatabaseType<C>
          ? DatabaseType<C>
          : FindOneResult<C, K>
      >
    )
    if (result) {
      const {_id: _, ...rest} = result
      cache.set(_id, {...cached, ...rest} as Cached<C>)
    } else cache.delete(_id)
    return result ? {...cached, ...result} : undefined
  }

// TODO: Uncurry if partial type inference is ever added: https://github.com/microsoft/TypeScript/issues/26242
const fetchValueC =
  <C extends CollectionsKeys>(col: Collection<C>) =>
  async <K extends keyof Cached<C>>(
    _id: DiscordType<C> | Snowflake,
    key: K
  ): Promise<DatabaseType<C>[K] | undefined> =>
    (await findOne(col)(_id, [key]))?.[key]

export const fetchValue = async <
  C extends CollectionsKeys,
  K extends keyof Cached<C>
>(
  database: Db,
  name: C,
  _id: DiscordType<C> | Snowflake,
  key: K
): Promise<DatabaseType<C>[K] | undefined> =>
  fetchValueC(collection(database, name))(_id, key)

export const setValue = async <
  C extends CollectionsKeys,
  K extends keyof Cached<C>
>(
  database: Db,
  name: C,
  id: DiscordType<C> | string,
  key: K,
  value: DatabaseType<C>[K]
): Promise<void> => {
  const col = collection(database, name)
  const _id = resolveID(id)
  await (
    col as {
      updateOne(
        filter: Filter<DatabaseType<C>>,
        update: Partial<DatabaseType<C>> | UpdateFilter<DatabaseType<C>>,
        options?: UpdateOptions
      ): Promise<Document | UpdateResult>
    }
  ).updateOne(
    {_id} as Filter<DatabaseType<C>>,
    {$set: {[key]: value} as MatchKeysAndValues<DatabaseType<C>>},
    {upsert: true}
  )
  updateCache(col, _id, cached => ({...cached, [key]: value} as Cached<C>))
}

// #endregion

/** Gets the prefix for a guild. */
export const fetchPrefix = async (
  database: Db,
  guild: Discord.Guild | Snowflake | null
): Promise<string> =>
  guild === null
    ? defaultPrefix
    : (await fetchValue(database, 'guilds', guild, 'prefix')) ?? defaultPrefix

/** Gets the timezone for a user. Defaults to UTC. */
export const fetchTimeZone = async (
  database: Db,
  user: DiscordUser | Snowflake
): Promise<string> =>
  (await fetchValue(database, 'users', user, 'timeZone')) ?? defaultTimeZone

// Rejoin

export const disableRejoin = async (
  database: Db,
  guild: Discord.Guild
): Promise<void> => {
  const col = collection(database, 'guilds')
  await col.updateOne({_id: guild.id}, {$unset: {members: 1, rejoinFlags: 1}})
}

export const fetchMemberRejoinInfo = async (
  guilds: Collection<'guilds'>,
  member: Discord.GuildMember
): Promise<Pick<Member, 'nickname' | 'roles'>> =>
  (
    await guilds
      .aggregate<{member?: Pick<Member, 'nickname' | 'roles'>}>([
        {$match: {_id: member.guild.id}},
        {$limit: 1},
        {
          $project: {
            _id: 0,
            member: {
              $first: {
                $filter: {
                  input: '$members',
                  cond: {$eq: ['$$this._id', member.id]}
                }
              }
            }
          }
        },
        {$project: {member: {roles: 1, nickname: 1}}}
      ])
      .next()
  )?.member ?? {}

const removeMemberArgs = ({
  guild,
  id
}: Pick<Discord.GuildMember, 'guild' | 'id'>): {
  filter: Filter<Guild>
  update: UpdateFilter<Guild>
} => ({filter: {_id: guild.id}, update: {$pull: {members: {_id: id}}}})

export const removeMember = async (
  guilds: Collection<'guilds'>,
  member: Discord.GuildMember
): Promise<void> => {
  const {filter, update} = removeMemberArgs(member)
  await guilds.updateOne(filter, update)
}

export const addMemberRejoinInfo = async (
  database: Db,
  enabledRoles: number,
  enabledNickname: number,
  {id, guild, roles, nickname}: Discord.GuildMember
): Promise<void> => {
  const guilds = collection(database, 'guilds')
  const member: Member = {
    _id: id,
    ...(enabledRoles ? {roles: roles.cache.keyArray()} : {}),
    ...(enabledNickname ? {nickname} : {})
  }
  await guilds.bulkWrite([
    /*
     * Even though the member should be removed from the database once they
     * rejoin, you never know if the bot will ever be offline and won't be
     * able to remove it.
     */
    {
      updateOne: removeMemberArgs({id, guild})
    },
    {
      updateOne: {
        filter: {_id: guild.id},
        update: {$push: {members: member}},
        upsert: true
      }
    }
  ])
}

export const fetchRejoinGuilds = (
  database: Db
): FindCursor<Pick<Guild, '_id' | 'rejoinFlags'>> =>
  collection(database, 'guilds').find(
    {rejoinFlags: {$exists: true}},
    {projection: {rejoinFlags: 1}}
  )

// Trivia

export const addTriviaQuestion = async (
  database: Db,
  user: DiscordUser | Snowflake,
  {category, type, difficulty}: TriviaQuestion,
  correct?: boolean
): Promise<void> => {
  const id = resolveID(user)
  const users = collection(database, 'users')
  const dbQuestion: Question = {
    category,
    type,
    difficulty,
    correct
  }
  await users.updateOne(
    {_id: id},
    {
      $push: {
        questionsAnswered: dbQuestion
      }
    },
    {upsert: true}
  )
}

export const triviaUsersCountQuery = async (
  guild: Discord.Guild
): Promise<Filter<User>> => ({
  _id: {$in: (await guild.members.fetch()).keyArray()},
  questionsAnswered: {$exists: true, $not: {$size: 0}}
})

export const triviaUsersCount = async (
  users: Collection<'users'>,
  query: Filter<User>
): Promise<number> => users.countDocuments(query)

export interface AggregatedTriviaUser {
  _id: Snowflake
  correct: number
  total: number
  percentage: number
}

export const aggregateTriviaUsers = async (
  users: Collection<'users'>,
  query: Filter<User>,
  skip: number
): Promise<readonly AggregatedTriviaUser[]> =>
  users
    .aggregate<AggregatedTriviaUser>([
      {$match: query},
      {
        $project: {
          correct: {
            $size: {
              $filter: {input: '$questionsAnswered', cond: '$$this.correct'}
            }
          },
          total: {$size: '$questionsAnswered'}
        }
      },
      {
        $project: {
          correct: 1,
          total: 1,
          percentage: {$divide: ['$correct', '$total']}
        }
      },
      {
        $sort: {
          percentage: -1,
          correct: -1
        }
      },
      {$skip: skip},
      {$limit: 10}
    ])
    .toArray()

// Connect

/** Connects to the database. */
export const connect = async (
  username: string,
  password: string,
  name: string
): Promise<Db> =>
  (
    await new MongoClient(
      `mongodb+srv://comrade-pingu.vnvdt.mongodb.net/${name}`,
      {auth: {username, password}, retryWrites: true, w: 'majority'}
    ).connect()
  ).db(name)
