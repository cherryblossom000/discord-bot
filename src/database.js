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
export const fetchValue = async (database, name, _id, key) => (await collection(database, name).findOne({ _id }, { projection: { _id: 0, [key]: 1 } }))?.[key];
export const setValue = async (database, name, id, key, value) => {
    const col = collection(database, name);
    await col.updateOne({ _id: id }, { $set: { [key]: value } }, { upsert: true });
};
export const fetchTimeZone = async (database, user) => (await fetchValue(database, 'users', user, 'timeZone')) ?? defaultTimeZone;
export const disableRejoin = async (database, guild) => {
    await collection(database, 'guilds').updateOne({ _id: guild }, { $unset: { members: 1, rejoinFlags: 1 } });
};
export const fetchMemberRejoinInfo = async (guilds, guild, member) => (await guilds
    .aggregate([
    { $match: { _id: guild } },
    { $limit: 1 },
    {
        $project: {
            _id: 0,
            member: {
                $first: {
                    $filter: {
                        input: '$members',
                        cond: { $eq: ['$$this._id', member] }
                    }
                }
            }
        }
    },
    { $project: { member: { roles: 1, nickname: 1 } } }
])
    .next())?.member ?? {};
const removeMemberArgs = (guild, member) => ({ filter: { _id: guild }, update: { $pull: { members: { _id: member } } } });
export const removeMember = async (guilds, ...args) => {
    const { filter, update } = removeMemberArgs(...args);
    await guilds.updateOne(filter, update);
};
export const addMemberRejoinInfo = async (database, enabledRoles, enabledNickname, member) => {
    const { id, guild, roles, nickname } = member;
    const guilds = collection(database, 'guilds');
    const dbMember = {
        _id: id,
        ...(enabledRoles ? { roles: [...roles.cache.keys()] } : {}),
        ...(enabledNickname ? { nickname } : {})
    };
    await guilds.bulkWrite([
        {
            updateOne: removeMemberArgs(guild.id, id)
        },
        {
            updateOne: {
                filter: { _id: guild.id },
                update: { $push: { members: dbMember } },
                upsert: true
            }
        }
    ]);
};
export const fetchRejoinGuilds = (database) => collection(database, 'guilds').find({ rejoinFlags: { $exists: true } }, { projection: { rejoinFlags: 1 } });
export const addTriviaQuestion = async (database, user, { category, type, difficulty }, correct) => {
    const users = collection(database, 'users');
    const dbQuestion = {
        category,
        type,
        difficulty,
        correct
    };
    await users.updateOne({ _id: user }, {
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