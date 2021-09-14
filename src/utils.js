import path from 'node:path';
import { homedir } from 'node:os';
import originalCleanStack from 'clean-stack';
import { Channel as DiscordChannel, Constants, DiscordAPIError, Message as DiscordMessage } from 'discord.js';
import yts from 'yt-search';
import { dev, emojis, me } from './constants.js';
const stackBasePath = path.join(homedir(), ...(dev
    ? ['dev', 'node', 'comrade-pingu', 'packages', 'bot']
    : ['comrade-pingu']));
const cleanStack = (stack) => originalCleanStack(stack, { basePath: stackBasePath });
const cleanErrorsStack = (error) => {
    error.stack = error.stack === undefined ? '' : cleanStack(error.stack);
    return error;
};
export const ignoreError = (key) => (error) => {
    if (!(error instanceof DiscordAPIError &&
        error.code === Constants.APIErrors[key]))
        throw error;
};
export const handleError = (client, error, info, messageOrChannel, response = 'unfortunately, there was an error trying to execute that command. Noot noot.') => {
    const errorHandler = (err) => {
        if (err instanceof Error)
            cleanErrorsStack(err);
        console.error('The error', err, 'occurred when trying to handle the error', error);
    };
    (async () => {
        if (error instanceof Error)
            cleanErrorsStack(error);
        if (messageOrChannel) {
            await (messageOrChannel instanceof DiscordMessage
                ? messageOrChannel.reply(response)
                : messageOrChannel.send(response)).catch(errorHandler);
        }
        if (dev)
            throw error;
        try {
            await (await client.users.fetch(me)).send(`${info}
**Error at ${new Date().toLocaleString()}**${error instanceof Error
                ? error.stack
                    ? `
      ${error.stack}`
                    : ''
                : error}${error instanceof DiscordAPIError
                ? `
Code: ${error.code} (${Object.entries(Constants.APIErrors).find(([, code]) => code === error.code)?.[0] ?? 'unknown'})
Path: ${error.path}
Method: ${error.method}
Status: ${error.httpStatus}`
                : ''}`);
        }
        catch (_error) {
            errorHandler(_error);
        }
    })();
};
export const hasPermissions = ({ channel, client }, permissions) => channel.permissionsFor(client.user)?.has(permissions) ?? false;
export const checkPermissions = async (message, permissions) => {
    const { channel, client, guild } = message;
    const channelPermissions = channel.permissionsFor(client.user);
    if (channelPermissions?.has(permissions) !== true) {
        const neededPermissions = Array.isArray(permissions)
            ? permissions.filter(p => channelPermissions?.has(p) === true)
            : [permissions];
        const plural = neededPermissions.length !== 1;
        const permissionsString = ` permission${plural ? 's' : ''}`;
        await message.reply([
            `I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!`,
            neededPermissions.map(p => `- ${p}`).join('\n'),
            `To fix this, ask an admin or the owner of the server to add th${plural ? 'ose' : 'at'}${permissionsString} to ${guild.me.roles.cache.find(role => role.managed)}.`
        ]);
        return false;
    }
    return true;
};
const idRegex = /^\d{17,19}$/u;
const userTagRegex = /^.{2,}#\d{4}$/u;
const messageLinkRegex = /https?:\/\/.*?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)/u;
const channelMentionRegex = /^<#(\d{17,19})>$/gu;
const execOnce = (regex, string) => {
    const result = regex.exec(string);
    regex.lastIndex = 0;
    return result;
};
export const resolveUser = async (message, input) => {
    const { author, client, guild, mentions } = message;
    const mentionedUser = mentions.users.first();
    if (mentionedUser)
        return mentionedUser;
    if (!input)
        return author;
    const getUser = async (key) => {
        if (!guild && input !== author[key] && input !== client.user[key]) {
            await message.reply('you can only get information about you or I in a DM!');
            return null;
        }
        const user = client.users.cache.find(u => u[key] === input);
        if (!user || !guild?.member(user)) {
            await message.reply(`‘${input}’ is not a valid user or is not a member of this guild!`);
            return null;
        }
        return user;
    };
    if (userTagRegex.test(input))
        return getUser('tag');
    if (idRegex.test(input))
        return getUser('id');
    await message.reply(`‘${input}’ is not a valid user tag or ID!`);
    return null;
};
const constNull = () => null;
export const resolveMessage = async (message, messageInput, channelInput) => {
    const { channel, client, flags, guild, reference } = message;
    const resolve = async (guildID, channelOrID, messageID) => {
        const channelID = channelOrID instanceof DiscordChannel ? channelOrID.id : channelOrID;
        if ((guild && guildID !== guild.id) ||
            (!guild && (guildID !== '@me' || channelID !== channel.id))) {
            await message.reply('that message is from another server or DM! Noot noot.');
            return null;
        }
        const resolvedChannel = channelOrID instanceof DiscordChannel
            ? channelOrID
            : await client.channels.fetch(channelOrID).catch(constNull);
        if (!resolvedChannel) {
            await message.reply(`channel with ID ${channelID} doesn’t exist or I don’t have permissions to view it!`);
            return null;
        }
        if (resolvedChannel.type === 'voice' || resolvedChannel.type === 'store') {
            await message.reply(`channel ${resolvedChannel.name} is a ${resolvedChannel.type} channel!`);
            return null;
        }
        const resolvedMessage = await resolvedChannel.messages
            .fetch(messageID)
            .catch(constNull);
        if (!resolvedMessage) {
            await message.reply(`message with ID ${messageID} in ${resolvedChannel.type === 'dm'
                ? 'this channel'
                :
                    resolvedChannel} doesn’t exist or I don’t have permissions to view it!`);
            return null;
        }
        return resolvedMessage;
    };
    const referencedMessage = reference?.messageID != null && !flags.has('IS_CROSSPOST')
        ?
            await channel.messages.fetch(reference.messageID).catch(constNull)
        : null;
    if (referencedMessage)
        return referencedMessage;
    if (messageInput === undefined) {
        await message.reply('you must provide a message link or ID if you aren’t replying to a message!');
        return null;
    }
    let result;
    const messageLinkResult = execOnce(messageLinkRegex, messageInput);
    if (messageLinkResult) {
        const [, guildID, channelID, messageID] = messageLinkResult;
        result = await resolve(guildID, channelID, messageID);
    }
    else if (idRegex.test(messageInput)) {
        let channelOrID;
        if (channelInput === undefined)
            channelOrID = channel;
        else {
            const channelMentionResult = execOnce(channelMentionRegex, channelInput);
            if (!channelMentionResult) {
                await message.reply(`${channelInput} is not a valid channel!`);
                return null;
            }
            ;
            [, channelOrID] = channelMentionResult;
        }
        result = await resolve(guild?.id ?? '@me', channelOrID, messageInput);
    }
    else {
        await message.reply(`‘${messageInput}${channelInput === undefined ? '' : ` ${channelInput}`}’ is not a valid message link or ID!`);
        return null;
    }
    return result;
};
export const createDateFormatter = (timeZone) => {
    const format = new Intl.DateTimeFormat('en-AU', {
        dateStyle: 'short',
        timeStyle: 'long',
        timeZone
    });
    return (date) => {
        const parts = format.formatToParts(date);
        const part = (type) => parts.find(p => p.type === type)?.value;
        return `${part('day')}/${part('month')}/${part('year')}, ${part('hour')}:${part('minute')} ${part('dayPeriod').toLowerCase()} ${part('timeZoneName') ?? 'GMT'}`;
    };
};
export const formatBoolean = (boolean) => boolean ?? false ? 'Yes' : 'No';
export const imageField = (name, url) => ({
    name,
    value: `[Link](${url})`
});
export const getQueue = (async ({ channel, client: { queues }, guild }, errorOnEmpty = false) => {
    const queue = queues.get(guild.id);
    if (errorOnEmpty ? !!(queue?.songs.length ?? 0) : !!queue)
        return queue;
    await channel.send('No music is playing!');
});
export const searchToVideo = ({ title, videoId: id, author: { name } }) => ({ title, id, author: name });
export const searchYoutube = async (message, query) => {
    if (message.guild &&
        !(await checkPermissions(message, [
            'EMBED_LINKS',
            'READ_MESSAGE_HISTORY',
            'ADD_REACTIONS'
        ])))
        return;
    const { author, channel } = message;
    const { videos } = await yts(query);
    if (!videos.length) {
        await channel.send(`No results were found for ${query}. Try using a YouTube link instead.`);
        return;
    }
    let current;
    const generateEmbed = (skip) => {
        current = videos.slice(skip, skip + 10);
        return [
            '**Which song would you like to play?**',
            {
                embed: {
                    title: `Showing songs ${skip + 1}-${skip + current.length} out of ${videos.length}`,
                    description: `Click on the title for the YouTube link.
If you can’t be bothered to wait for the reactions you can just add the reaction yourself.`,
                    fields: current.map((v, i) => ({
                        name: `${i + skip + 1}. ${v.author.name}
${emojis.numbers[i + 1]}`,
                        value: `[${v.title}](${v.url})`,
                        inline: true
                    }))
                }
            }
        ];
    };
    const embedMessage = await channel.send(...generateEmbed(0));
    const reactNumbers = async () => {
        for (let i = 1; i <= current.length; i++)
            await embedMessage.react(emojis.numbers[i]);
    };
    if (videos.length <= 10)
        return;
    await embedMessage.react(emojis.right);
    await reactNumbers();
    let currentIndex = 0;
    const collector = embedMessage.createReactionCollector(({ emoji: { name } }, { id }) => [emojis.left, emojis.right, ...emojis.numbers].includes(name) &&
        id === author.id, { idle: 60000 });
    return new Promise(resolve => {
        collector.on('collect', async ({ emoji: { name } }) => {
            const n = emojis.numbers.indexOf(name);
            if (n > current.length)
                return;
            if (n > -1) {
                collector.stop();
                resolve(current[n - 1]);
                return;
            }
            let shouldReact = true;
            await embedMessage.reactions.removeAll().catch(error => {
                ignoreError('MISSING_PERMISSIONS')(error);
                shouldReact = false;
            });
            currentIndex += name === emojis.left ? -10 : 10;
            await embedMessage.edit(...generateEmbed(currentIndex));
            if (shouldReact) {
                if (currentIndex)
                    await embedMessage.react(emojis.left);
                if (currentIndex + 10 < videos.length)
                    await embedMessage.react(emojis.right);
                await reactNumbers();
            }
        });
    });
};
//# sourceMappingURL=utils.js.map