import { MongoClient } from 'mongodb';
import { defaultTimeZone } from './constants.js';
const collectionCache = new WeakMap();
export const collection = (database, name) => {
    const cache = collectionCache.get(database) ??
        (() => {
            const newCache = new Map();
            collectionCache.set(database, newCache);
            return newCache;
        })();
    const newCollection = database.collection(name);
    cache.set(name, newCollection);
    return newCollection;
};
const resolveID = (id) => typeof id == 'string' ? id : id.id;
const documentsCache = new WeakMap();
const getCache = (col) => {
    const existingCache = documentsCache.get(col);
    if (existingCache)
        return existingCache;
    const newCache = new Map();
    documentsCache.set(col, newCache);
    return newCache;
};
const updateCache = (col, id, value) => {
    const cache = getCache(col);
    const resolvedID = resolveID(id);
    const result = typeof value == 'function' ? value(cache.get(resolvedID)) : value;
    result ? cache.set(resolvedID, result) : cache.delete(resolvedID);
};
const findOne = (col) => async (id, keys, filter, options) => {
    const _id = resolveID(id);
    const cache = getCache(col);
    const cached = cache.get(_id);
    const cachedKeys = cached ? Object.keys(cached) : [];
    const keysToFetch = keys.filter(key => !cachedKeys.includes(key));
    if (!keysToFetch.length)
        return cached;
    const result = await col.findOne({ ...filter, _id }, {
        ...options,
        projection: Object.fromEntries(keysToFetch.map(key => [key, 1]))
    });
    if (result) {
        const { _id: _, ...rest } = result;
        cache.set(_id, { ...cached, ...rest });
    }
    else
        cache.delete(_id);
    return result ? { ...cached, ...result } : undefined;
};
const fetchValueC = (col) => async (_id, key) => (await findOne(col)(_id, [key]))?.[key];
export const fetchValue = async (database, name, _id, key) => fetchValueC(collection(database, name))(_id, key);
export const setValue = async (database, name, id, key, value) => {
    const col = collection(database, name);
    const _id = resolveID(id);
    await col.updateOne({ _id }, { $set: { [key]: value } }, { upsert: true });
    updateCache(col, _id, cached => ({ ...cached, [key]: value }));
};
export const fetchTimeZone = async (database, user) => (await fetchValue(database, 'users', user, 'timeZone')) ?? defaultTimeZone;
export const disableRejoin = async (database, guild) => {
    const col = collection(database, 'guilds');
    await col.updateOne({ _id: guild.id }, { $unset: { members: 1, rejoinFlags: 1 } });
};
export const fetchMemberRejoinInfo = async (guilds, member) => (await guilds
    .aggregate([
    { $match: { _id: member.guild.id } },
    { $limit: 1 },
    {
        $project: {
            _id: 0,
            member: {
                $first: {
                    $filter: {
                        input: '$members',
                        cond: { $eq: ['$$this._id', member.id] }
                    }
                }
            }
        }
    },
    { $project: { member: { roles: 1, nickname: 1 } } }
])
    .next())?.member ?? {};
const removeMemberArgs = ({ guild, id }) => ({ filter: { _id: guild.id }, update: { $pull: { members: { _id: id } } } });
export const removeMember = async (guilds, member) => {
    const { filter, update } = removeMemberArgs(member);
    await guilds.updateOne(filter, update);
};
export const addMemberRejoinInfo = async (database, enabledRoles, enabledNickname, { id, guild, roles, nickname }) => {
    const guilds = collection(database, 'guilds');
    const member = {
        _id: id,
        ...(enabledRoles ? { roles: [...roles.cache.keys()] } : {}),
        ...(enabledNickname ? { nickname } : {})
    };
    await guilds.bulkWrite([
        {
            updateOne: removeMemberArgs({ id, guild })
        },
        {
            updateOne: {
                filter: { _id: guild.id },
                update: { $push: { members: member } },
                upsert: true
            }
        }
    ]);
};
export const fetchRejoinGuilds = (database) => collection(database, 'guilds').find({ rejoinFlags: { $exists: true } }, { projection: { rejoinFlags: 1 } });
export const addTriviaQuestion = async (database, user, { category, type, difficulty }, correct) => {
    const id = resolveID(user);
    const users = collection(database, 'users');
    const dbQuestion = {
        category,
        type,
        difficulty,
        correct
    };
    await users.updateOne({ _id: id }, {
        $push: {
            questionsAnswered: dbQuestion
        }
    }, { upsert: true });
};
export const triviaUsersCountQuery = async (guild) => ({
    _id: { $in: [...(await guild.members.fetch()).keys()] },
    questionsAnswered: { $exists: true, $not: { $size: 0 } }
});
export const triviaUsersCount = async (users, query) => users.countDocuments(query);
export const aggregateTriviaUsers = async (users, query, skip) => users
    .aggregate([
    { $match: query },
    {
        $project: {
            correct: {
                $size: {
                    $filter: { input: '$questionsAnswered', cond: '$$this.correct' }
                }
            },
            total: { $size: '$questionsAnswered' }
        }
    },
    {
        $project: {
            correct: 1,
            total: 1,
            percentage: { $divide: ['$correct', '$total'] }
        }
    },
    {
        $sort: {
            percentage: -1,
            correct: -1
        }
    },
    { $skip: skip },
    { $limit: 10 }
])
    .toArray();
export const connect = async (username, password, name) => (await new MongoClient(`mongodb+srv://comrade-pingu.vnvdt.mongodb.net/${name}`, { auth: { username, password }, retryWrites: true, w: 'majority' }).connect()).db(name);
//# sourceMappingURL=database.js.map