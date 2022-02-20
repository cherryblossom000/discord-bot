import path from 'node:path';
import { homedir } from 'node:os';
import { bold, codeBlock, hyperlink } from '@discordjs/builders';
import originalCleanStack from 'clean-stack';
import D, { Constants, DiscordAPIError, Message } from 'discord.js';
import { dev, me } from '../constants.js';
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
export const fetchMessage = async ({ client, options }) => {
    const message = options.getMessage('message', true);
    return message instanceof Message
        ? message
        : (await client.channels.fetch(message.channel_id)).messages.fetch(message.id);
};
export const replyAndFetch = async (interaction, options, followUp = false) => {
    const opts = {
        ...options,
        fetchReply: true
    };
    const message = await (followUp
        ? interaction.followUp(opts)
        : interaction.reply(opts));
    return message instanceof D.Message
        ? message
        : (await interaction.client.channels.fetch(interaction.channelId)).messages.fetch(message.id);
};
export const checkPermissions = async (interaction, permissions) => {
    if (!interaction.inGuild())
        return true;
    const { client, guildId } = interaction;
    const channel = (await fetchChannel(interaction));
    const channelPermissions = channel.permissionsFor(client.user);
    if (channelPermissions?.has(permissions) !== true) {
        const neededPermissions = Array.isArray(permissions)
            ? permissions.filter(p => channelPermissions?.has(p) === true)
            : [permissions];
        const plural = neededPermissions.length !== 1;
        const permissionsString = ` permission${plural ? 's' : ''}`;
        await interaction.reply(`I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!
${neededPermissions.map(p => `- ${p}`).join('\n')}
To fix this, ask an admin or the owner of the server to add th${plural ? 'ose' : 'at'}${permissionsString} to ${(await client.guilds.fetch(guildId)).me.roles.cache.find(role => role.managed)}.`);
        return false;
    }
    return true;
};
export const checkIfAdmin = async (interaction, guild) => {
    if (!(await guild.members.fetch(interaction.user.id)).permissions.has('ADMINISTRATOR')) {
        await interaction.reply({
            content: 'This command can only be used by an administrator!',
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
//# sourceMappingURL=utils.js.map