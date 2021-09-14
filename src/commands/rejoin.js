import { me } from '../constants.js';
import { addMemberRejoinInfo, collection, fetchMemberRejoinInfo, fetchValue, removeMember, setValue, disableRejoin } from '../database.js';
import { checkPermissions, handleError } from '../utils.js';
export const addListeners = (client, guild, database, flags) => {
    const enabledRoles = flags & 1;
    const enabledNickname = flags & 2;
    const enabledAll = enabledRoles && enabledNickname;
    const guildMemberAdd = async (member) => {
        if (member.guild.id === guild.id) {
            const guilds = collection(database, 'guilds');
            try {
                const { roles, nickname } = await fetchMemberRejoinInfo(guilds, member);
                await Promise.all([
                    ...(enabledRoles && roles
                        ? [
                            member.roles.add(roles.filter(r => member.guild.roles.cache.has(r)))
                        ]
                        : []),
                    ...(enabledNickname && nickname !== undefined
                        ? [member.setNickname(nickname)]
                        : [])
                ]);
            }
            catch (error) {
                handleError(client, error, `Rejoin guildMemberAdd failed (member ${member.id}, flags ${flags})`, (!guild.systemChannelFlags.has('WELCOME_MESSAGE_DISABLED') &&
                    guild.systemChannel) ||
                    undefined, `Welcome, ${member}! Unfortunately, there was an error trying to ${enabledRoles ? 'assign roles to you' : ''}${enabledAll ? ' and/or ' : ''}${enabledNickname ? 'set your nickname' : ''}.${guild.owner
                    ? `
${guild.owner} sorry, but you have to do this yourself.`
                    : ''}`);
            }
            removeMember(guilds, member).catch(error => handleError(client, error, `Removing member from DB failed (member ${member.id}, flags ${flags})`));
        }
    };
    const guildMemberRemove = async (member) => {
        if (member.guild.id === guild.id) {
            await addMemberRejoinInfo(database, enabledRoles, enabledNickname, member).catch(error => handleError(client, error, `Rejoin guildMemberRemove failed (member ${member.id}, flags ${flags})`, (!guild.systemChannelFlags.has('WELCOME_MESSAGE_DISABLED') &&
                guild.systemChannel) ||
                undefined, `${member.displayName} has left the server. Unfortunately, there was an error trying to save their ${enabledRoles ? 'roles' : ''}${enabledAll ? ' and/or ' : ''}${enabledNickname ? 'nickname' : ''}.${guild.owner
                ? `
  ${guild.owner} sorry, but when they rejoin, you may have to manually ${enabledRoles ? 'assign their roles' : ''}${enabledAll ? ' and/or ' : ''}${enabledNickname ? 'set their nickname' : ''}.`
                : ''}`));
        }
    };
    client
        .on('guildMemberAdd', guildMemberAdd)
        .on('guildMemberRemove', guildMemberRemove)
        .rejoinListeners.set(guild.id, {
        guildMemberAdd,
        guildMemberRemove
    });
};
const getRejoinStatus = async ({ channel, guild }, database) => {
    const rejoinFlags = await fetchValue(database, 'guilds', guild, 'rejoinFlags');
    await channel.send(rejoinFlags === undefined
        ? 'Disabled'
        : [
            ...(rejoinFlags & 1 ? ['Roles'] : []),
            ...(rejoinFlags & 2 ? ['Nicknames'] : [])
        ].join(', '));
};
const checkIfAdmin = async (message) => {
    if (message.member.hasPermission('ADMINISTRATOR') &&
        message.author.id !== me) {
        await message.reply('This command can only be used by someone with the Manage Messages permission or the bot owner!');
        return false;
    }
    return true;
};
const enable = async (message, database, mode) => {
    if (!(await checkIfAdmin(message)))
        return;
    const flags = mode === 'roles' || mode === 'r'
        ? 1
        : mode === 'nickname' || mode === 'n'
            ? 2
            : mode === 'all' || mode === 'a' || mode === undefined
                ? 3
                : undefined;
    if (flags === undefined) {
        await message.reply(`${mode} is not valid!
Valid options: roles, nickname, all`);
        return;
    }
    if (!(await checkPermissions(message, [
        ...(flags & 1 ? ['MANAGE_ROLES'] : []),
        ...(flags & 2
            ? ['MANAGE_NICKNAMES']
            : [])
    ])))
        return;
    const { client, channel, guild } = message;
    addListeners(client, guild, database, flags);
    await setValue(database, 'guilds', guild, 'rejoinFlags', flags);
    await channel.send('Successfully enabled! Noot noot.');
};
const disable = async (message, database) => {
    if (!(await checkIfAdmin(message)))
        return;
    const { channel, client, guild } = message;
    const listeners = client.rejoinListeners.get(guild.id);
    if (!listeners) {
        await channel.send('Already disabled! Noot noot.');
        return;
    }
    await disableRejoin(database, guild);
    client.off('guildMemberAdd', listeners.guildMemberAdd);
    client.off('guildMemberRemove', listeners.guildMemberRemove);
    client.rejoinListeners.delete(guild.id);
};
const command = {
    name: 'rejoin',
    aliases: ['re', 'rj'],
    description: 'Manages settings for what to do when a member rejoins this server.',
    syntax: '[e(nable) [r(oles)|n(ickname)|a(ll)]]|[d(isable)]',
    usage: `This command has 3 subcommands.
\`rejoin\`
See this server’s rejoining configuration.

\`rejoin e(nable) [r(oles)|n(ickname)|a(ll)]\`
Enables adding a member’s past roles, nickname, or both of these. Defaults to \`all\`.

\`rejoin d(isable)\`
Stops doing anything when a member rejoins this server.`,
    guildOnly: true,
    cooldown: 10,
    async execute(message, { args: [subcommand, mode] }, database) {
        switch (subcommand) {
            case 'enable':
            case 'e':
                await enable(message, database, mode);
                break;
            case 'disable':
            case 'd':
                await disable(message, database);
                break;
            default:
                await getRejoinStatus(message, database);
        }
    }
};
export default command;
//# sourceMappingURL=rejoin.js.map