import { addMemberRejoinInfo, collection, disableRejoin, fetchMemberRejoinInfo, fetchValue, removeMember, setValue } from '../database.js';
import { checkPermissions, fetchGuild, handleError } from './utils.js';
const rejoinModeToFlags = {
    ["roles"]: 1,
    ["nickname"]: 2,
    ["both"]: 1 | 2
};
const fetchOwner = async (guild) => guild.fetchOwner().catch(() => undefined);
export const addListeners = (client, guild, database, flags) => {
    const enabledRoles = flags & 1;
    const enabledNickname = flags & 2;
    const enabledAll = enabledRoles && enabledNickname;
    const guildMemberAdd = async (member) => {
        if (member.guild.id === guild.id) {
            const guilds = collection(database, 'guilds');
            try {
                const { roles, nickname } = await fetchMemberRejoinInfo(guilds, member.guild.id, member.id);
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
                const owner = await fetchOwner(guild);
                handleError(client, error, `Rejoin guildMemberAdd failed (member ${member.id}, flags ${flags})`, {
                    to: (!guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') &&
                        guild.systemChannel) ||
                        undefined,
                    response: `Welcome, ${member}! Unfortunately, there was an error trying to ${enabledRoles ? 'assign roles to you' : ''}${enabledAll ? ' and/or ' : ''}${enabledNickname ? 'set your nickname' : ''}.${owner
                        ? `
${owner} sorry, but you have to do this yourself.`
                        : ''}`
                });
                return;
            }
            removeMember(guilds, member.guild.id, member.id).catch(error => handleError(client, error, `Removing member from DB failed (member ${member.id}, flags ${flags})`));
        }
    };
    const guildMemberRemove = async (member) => {
        if (member.guild.id === guild.id) {
            await addMemberRejoinInfo(database, enabledRoles, enabledNickname, member).catch(async (error) => {
                const owner = await fetchOwner(guild);
                handleError(client, error, `Rejoin guildMemberRemove failed (member ${member.id}, flags ${flags})`, {
                    to: (!guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') &&
                        guild.systemChannel) ||
                        undefined,
                    response: `${member.displayName} has left the server. Unfortunately, there was an error trying to save their ${enabledRoles ? 'roles' : ''}${enabledAll ? ' and/or ' : ''}${enabledNickname ? 'nickname' : ''}.${owner
                        ? `
${owner} sorry, but when they rejoin, you may have to manually ${enabledRoles ? 'assign their roles' : ''}${enabledAll ? ' and/or ' : ''}${enabledNickname ? 'set their nickname' : ''}.`
                        : ''}`
                });
            });
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
export const status = async (interaction, database) => {
    const rejoinFlags = await fetchValue(database, 'guilds', interaction.guildId, 'rejoinFlags');
    await interaction.reply(rejoinFlags === undefined
        ? 'Disabled'
        : [
            ...(rejoinFlags & 1 ? ['Roles'] : []),
            ...(rejoinFlags & 2 ? ['Nicknames'] : [])
        ].join(', '));
};
export const set = async (interaction, database, mode) => {
    const flags = rejoinModeToFlags[mode];
    const guild = await fetchGuild(interaction);
    if (!(await checkPermissions(interaction, [
        ...(flags & 1 ? ['MANAGE_ROLES'] : []),
        ...(flags & 2
            ? ['MANAGE_NICKNAMES']
            : [])
    ])))
        return;
    addListeners(interaction.client, guild, database, flags);
    await setValue(database, 'guilds', interaction.guildId, 'rejoinFlags', flags);
    await interaction.reply('Successfully enabled! Noot noot.');
};
export const disable = async (interaction, database) => {
    const { client, guildId } = interaction;
    const listeners = client.rejoinListeners.get(guildId);
    if (!listeners) {
        await interaction.reply('Already disabled! Noot noot.');
        return;
    }
    await disableRejoin(database, guildId);
    client
        .off('guildMemberAdd', listeners.guildMemberAdd)
        .off('guildMemberRemove', listeners.guildMemberRemove)
        .rejoinListeners.delete(guildId);
};
//# sourceMappingURL=rejoin.js.map