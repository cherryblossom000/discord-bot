import {MongoClient} from 'mongodb'
import {defaultTimeZone} from './constants.js'
import type * as D from 'discord.js'
import type {
  Collection as MongoCollection,
  Db as MongoDb,
  Document,
  Filter,
  FindCursor,
  MatchKeysAndValues,
  UpdateFilter,
  UpdateOptions,
  UpdateResult
} from 'mongodb'
import type {Difficulty, Type, Question as TriviaQuestion} from './opentdb'
import type {Override} from './utils'

// #region Models

export const enum MemberRejoinFlags {
  Roles = 1,
  Nickname
}

interface Member {
  _id: D.Snowflake
  roles?: readonly D.Snowflake[]
  nickname?: string | null
}

// eslint-disable-next-line import/no-unused-modules -- it is used
export interface Guild {
  _id: D.Snowflake
  rejoinFlags?: MemberRejoinFlags
  members?: readonly Member[]
  colourRoles?: boolean
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

interface Collections {
  guilds: Guild
  users: User
}

type CollectionsKeys = keyof Collections
type DatabaseType<C extends CollectionsKeys> = Collections[C]

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

export const fetchValue = async <
  C extends CollectionsKeys,
  K extends keyof DatabaseType<C>
>(
  database: Db,
  name: C,
  _id: D.Snowflake,
  key: K
): Promise<DatabaseType<C>[K] | undefined> =>
  (
    (await collection(database, name).findOne(
      {_id},
      {projection: {_id: 0, [key]: 1}}
    )) as Pick<DatabaseType<C>, K> | null
  )?.[key]

export const setValue = async <
  C extends CollectionsKeys,
  K extends keyof DatabaseType<C>
>(
  database: Db,
  name: C,
  id: D.Snowflake,
  key: K,
  value: DatabaseType<C>[K]
): Promise<void> => {
  const col = collection(database, name)
  await (
    col as {
      updateOne(
        filter: Filter<DatabaseType<C>>,
        update: Partial<DatabaseType<C>> | UpdateFilter<DatabaseType<C>>,
        options?: UpdateOptions
      ): Promise<Document | UpdateResult>
    }
  ).updateOne(
    {_id: id}, // as unknown as Filter<DatabaseType<C>>,
    {$set: {[key]: value} as MatchKeysAndValues<DatabaseType<C>>},
    {upsert: true}
  )
}

/** Gets the timezone for a user. Defaults to UTC. */
export const fetchTimeZone = async (
  database: Db,
  user: D.Snowflake
): Promise<string> =>
  (await fetchValue(database, 'users', user, 'timeZone')) ?? defaultTimeZone

// Rejoin

export const disableRejoin = async (
  database: Db,
  guild: D.Snowflake
): Promise<void> => {
  await collection(database, 'guilds').updateOne(
    {_id: guild},
    {$unset: {members: 1, rejoinFlags: 1}}
  )
}

export const fetchMemberRejoinInfo = async (
  guilds: Collection<'guilds'>,
  guild: D.Snowflake,
  member: D.Snowflake
): Promise<Pick<Member, 'nickname' | 'roles'>> =>
  (
    await guilds
      .aggregate<{member?: Pick<Member, 'nickname' | 'roles'>}>([
        {$match: {_id: guild}},
        {$limit: 1},
        {
          $project: {
            _id: 0,
            member: {
              $first: {
                $filter: {
                  input: '$members',
                  cond: {$eq: ['$$this._id', member]}
                }
              }
            }
          }
        },
        {$project: {member: {roles: 1, nickname: 1}}}
      ])
      .next()
  )?.member ?? {}

const removeMemberArgs = (
  guild: D.Snowflake,
  member: D.Snowflake
): {
  filter: Filter<Guild>
  update: UpdateFilter<Guild>
} => ({filter: {_id: guild}, update: {$pull: {members: {_id: member}}}})

export const removeMember = async (
  guilds: Collection<'guilds'>,
  ...args: Parameters<typeof removeMemberArgs>
): Promise<void> => {
  const {filter, update} = removeMemberArgs(...args)
  await guilds.updateOne(filter, update)
}

export const addMemberRejoinInfo = async (
  database: Db,
  enabledRoles: number,
  enabledNickname: number,
  member: D.GuildMember
): Promise<void> => {
  const {id, guild, roles, nickname} = member
  const guilds = collection(database, 'guilds')
  const dbMember: Member = {
    _id: id,
    ...(enabledRoles ? {roles: [...roles.cache.keys()]} : {}),
    ...(enabledNickname ? {nickname} : {})
  }
  await guilds.bulkWrite([
    /*
     * Even though the member should be removed from the database once they
     * rejoin, you never know if the bot will ever be offline and won't be
     * able to remove it.
     */
    {
      updateOne: removeMemberArgs(guild.id, id)
    },
    {
      updateOne: {
        filter: {_id: guild.id},
        update: {$push: {members: dbMember}},
        upsert: true
      }
    }
  ])
}

export const fetchRejoinGuilds = (
  database: Db
): FindCursor<Required<Pick<Guild, '_id' | 'rejoinFlags'>>> =>
  collection(database, 'guilds').find<
    Required<Pick<Guild, '_id' | 'rejoinFlags'>>
  >({rejoinFlags: {$exists: true}}, {projection: {rejoinFlags: 1}})

// Trivia

export const addTriviaQuestion = async (
  database: Db,
  user: D.Snowflake,
  {category, type, difficulty}: TriviaQuestion,
  correct?: boolean
): Promise<void> => {
  const users = collection(database, 'users')
  const dbQuestion: Question = {
    category,
    type,
    difficulty,
    correct
  }
  await users.updateOne(
    {_id: user},
    {
      $push: {
        questionsAnswered: dbQuestion
      }
    },
    {upsert: true}
  )
}

export const triviaUsersCountQuery = async (
  guild: D.Guild
): Promise<Filter<User>> => ({
  _id: {$in: [...(await guild.members.fetch()).keys()]},
  questionsAnswered: {$exists: true, $not: {$size: 0}}
})

export const triviaUsersCount = async (
  users: Collection<'users'>,
  query: Filter<User>
): Promise<number> => users.countDocuments(query)

export interface AggregatedTriviaUser {
  _id: D.Snowflake
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
  ).db(name) as Db
