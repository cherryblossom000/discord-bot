import path from 'node:path';
import { homedir } from 'node:os';
import { bold, codeBlock, hyperlink, inlineCode } from '@discordjs/builders';
import D, { Constants, DiscordAPIError, MessageButton } from 'discord.js';
import originalCleanStack from 'clean-stack';
import * as undici from 'undici';
import { dev, emojis, me } from '../constants.js';
export const inObject = (object, key) => key in object;
class RequestError extends Error {
    constructor(statusCode, message, url, body) {
        super(`${message} (url: ${url}) failed with status code ${statusCode}
Body: ${body}`);
        Object.defineProperty(this, "statusCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: statusCode
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: url
        });
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: body
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'RequestError'
        });
    }
}
export const request = async (message, url) => {
    const { statusCode, body } = await undici.request(url);
    if (statusCode !== 200) {
        throw new RequestError(statusCode, message, url.toString(), await body
            .text()
            .then(codeBlock)
            .catch(error => `${inlineCode('body.text()')} failed: ${error}`));
    }
    return body;
};
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
export const handleError = (client, error, info, { to: channelOrInteraction, response: content = 'Unfortunately, there was an error trying to execute that command. Noot noot.', followUp = false } = {}) => {
    const errorHandler = (err) => {
        if (err instanceof Error)
            cleanErrorsStack(err);
        console.error('The error', err, 'occurred when trying to handle the error', error);
    };
    (async () => {
        if (error instanceof Error)
            cleanErrorsStack(error);
        if (channelOrInteraction) {
            await (channelOrInteraction instanceof D.Interaction
                ? followUp
                    ? channelOrInteraction.followUp({ content, ephemeral: true })
                    : channelOrInteraction.reply({ content, ephemeral: true })
                : channelOrInteraction.send(content)).catch(errorHandler);
        }
        if (dev)
            throw error;
        try {
            await (await client.users.fetch(me)).send(`${info === undefined ? '' : `${info}\n`}${bold(`Error at ${new Date().toLocaleString()}`)}${error instanceof Error
                ? error.stack
                    ? `
      ${error.stack}`
                    : ''
                : error}${error instanceof DiscordAPIError
                ? `
Code: ${error.code} (${Object.entries(Constants.APIErrors).find(([, code]) => code === error.code)?.[0] ?? 'unknown'})
Path: ${error.path}
Method: ${error.method}
Status: ${error.httpStatus}
Request data:
${codeBlock('json', JSON.stringify(error.requestData, null, 2))}`
                : ''}`);
        }
        catch (error_) {
            errorHandler(error_);
        }
    })();
};
export const debugInteractionDetails = ({ id, channelId, options }) => `Id: ${id}
Channel: ${channelId}
Options: ${codeBlock('json', JSON.stringify(options.data, null, 2))}`;
export const fetchChannel = async (interaction) => {
    const { channelId, client } = interaction;
    const channel = (await client.channels.fetch(channelId));
    if (!channel) {
        throw new Error(`fetchChannel: Channel ${channelId} could not be fetched from interaction
${debugInteractionDetails(interaction)}`);
    }
    return channel;
};
export const fetchGuild = async ({ client, guildId }) => client.guilds.fetch(guildId);
export const replyAndFetch = async (interaction, options, mode = 0) => {
    const message = (await interaction[mode === 0
        ? 'reply'
        : mode === 1
            ? 'editReply'
            : 'followUp']({ ...options, fetchReply: true }));
    return message instanceof D.Message
        ? message
        : (await interaction.client.channels.fetch(interaction.channelId)).messages.fetch(message.id);
};
export const deleteMessage = async (client, channelId, messageId) => {
    await client['api']
        .channels(channelId)
        .messages(messageId)
        .delete();
};
export const checkPermissions = async (interaction, permissions) => {
    if (!interaction.inGuild())
        return true;
    const { client, guildId } = interaction;
    const channel = await fetchChannel(interaction);
    const channelPermissions = channel.permissionsFor(client.user);
    if (channelPermissions?.has(permissions) !== true) {
        const neededPermissions = Array.isArray(permissions)
            ? permissions.filter(p => channelPermissions?.has(p) === true)
            : [permissions];
        const plural = neededPermissions.length !== 1;
        const permissionsString = ` permission${plural ? 's' : ''}`;
        await interaction.reply({
            content: `I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!
${neededPermissions.map(p => `- ${p}`).join('\n')}
To fix this, ask an admin or the owner of the server to add th${plural ? 'ose' : 'at'}${permissionsString} to ${(await client.guilds.fetch(guildId)).me.roles.cache.find(role => role.managed)}.`,
            ephemeral: true
        });
        return false;
    }
    return true;
};
export const imageField = (name, url) => ({
    name,
    value: hyperlink('Link', url)
});
export const BACK = 'back';
export const FORWARD = 'forward';
const backButtonOptions = {
    style: 'SECONDARY',
    label: 'Back',
    emoji: emojis.left,
    customId: BACK
};
const forwardButtonOptions = {
    style: 'SECONDARY',
    label: 'Forward',
    emoji: emojis.right,
    customId: FORWARD
};
export const backButton = new MessageButton(backButtonOptions);
export const forwardButton = new MessageButton(forwardButtonOptions);
export const backButtonDisabled = new MessageButton({
    ...backButtonOptions,
    disabled: true
});
export const forwardButtonDisabled = new MessageButton({
    ...forwardButtonOptions,
    disabled: true
});
export const timeoutFollowUp = async (interaction) => {
    await interaction.followUp({
        content: 'You took too long to answer.',
        ephemeral: true
    });
};
//# sourceMappingURL=utils.js.map