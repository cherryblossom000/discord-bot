import { SlashCommandBuilder } from '@discordjs/builders';
import { addMemberRejoinInfo, collection, fetchMemberRejoinInfo, fetchValue, removeMember, setValue, disableRejoin } from '../../database.js';
import { checkPermissions, fetchGuild, handleError } from '../../utils.js';
const fetchOwner = async (guild) => guild.fetchOwner().catch(() => undefined);
const modeToFlags = {
    ["roles"]: 1,
    ["nickname"]: 2,
    ["both"]: 3
};
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
            }
            removeMember(guilds, member).catch(error => handleError(client, error, `Removing member from DB failed (member ${member.id}, flags ${flags})`));
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
const status = async (interaction, database) => {
    const rejoinFlags = await fetchValue(database, 'guilds', interaction.guildId, 'rejoinFlags');
    await interaction.reply(rejoinFlags === undefined
        ? 'Disabled'
        : [
            ...(rejoinFlags & 1 ? ['Roles'] : []),
            ...(rejoinFlags & 2 ? ['Nicknames'] : [])
        ].join(', '));
};
const checkIfAdmin = async (interaction, guild) => {
    if ((await guild.members.fetch(interaction.user.id)).permissions.has('ADMINISTRATOR')) {
        await interaction.reply('This command can only be used by someone with the Manage Messages permission or the bot owner!');
        return false;
    }
    return true;
};
const set = async (interaction, mode, database) => {
    const guild = await fetchGuild(interaction);
    if (!(await checkIfAdmin(interaction, guild)))
        return;
    const flags = modeToFlags[mode];
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
const disable = async (interaction, database) => {
    const guild = await fetchGuild(interaction);
    if (!(await checkIfAdmin(interaction, guild)))
        return;
    const { client, guildId } = interaction;
    const listeners = client.rejoinListeners.get(guildId);
    if (!listeners) {
        await interaction.reply('Already disabled! Noot noot.');
        return;
    }
    await disableRejoin(database, await fetchGuild(interaction));
    client
        .off('guildMemberAdd', listeners.guildMemberAdd)
        .off('guildMemberRemove', listeners.guildMemberRemove)
        .rejoinListeners.delete(guildId);
};
const STATUS = 'status';
const SET = 'set';
const MODE = 'mode';
const DISABLE = 'disable';
const command = {
    data: new SlashCommandBuilder()
        .setName('rejoin')
        .setDescription('Manages settings for what to do when a member rejoins this server.')
        .addSubcommand(subcommand => subcommand
        .setName(STATUS)
        .setDescription('Get this server’s rejoining configuration.'))
        .addSubcommand(subcommand => subcommand
        .setName(SET)
        .setDescription('Configure what I do when a member rejoins the server.')
        .addStringOption(option => option
        .setName(MODE)
        .setDescription('What to restore when a member rejoins the server.')
        .setRequired(true)
        .addChoices([
        ['roles', "roles"],
        ['nickname', "nickname"],
        ['both', "both"]
    ])))
        .addSubcommand(subcommand => subcommand
        .setName(DISABLE)
        .setDescription('Stops doing anything when a member rejoins this server.')),
    guildOnly: true,
    async execute(interaction, database) {
        switch (interaction.options.getSubcommand()) {
            case STATUS:
                await status(interaction, database);
                break;
            case SET:
                await set(interaction, interaction.options.getString(MODE, true), database);
                break;
            case DISABLE:
                await disable(interaction, database);
        }
    }
};
export default command;
//# sourceMappingURL=rejoin.js.map