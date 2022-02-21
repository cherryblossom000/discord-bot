import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { Constants } from 'discord.js';
import { fetchValue, setValue } from '../../database.js';
import { checkIfAdmin, checkPermissions, fetchGuild } from '../../utils.js';
const ENABLE = 'enable';
const DISABLE = 'disable';
const SET = 'set';
const COLOUR = 'colour';
const REMOVE = 'remove';
const SHORT_HEX_RE = /^[\da-f]{3}$/iu;
const LONG_HEX_RE = /^[\da-f]{6}$/iu;
const ROLE_RE = /^#[\da-f]{6}$/u;
const isColourRole = ({ name }) => ROLE_RE.test(name);
const COLOURS = {
    ...Constants.Colors,
    DISCORD_DARK_BACKGROUND: 0x36393f
};
const VALID_COLOURS = Object.keys(COLOURS)
    .map(c => inlineCode(c.toLowerCase().replaceAll('_', ' ')))
    .join(', ');
const parseColour = (string) => {
    const input = string.toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
    if (input in COLOURS)
        return COLOURS[input];
    const hex = input.startsWith('#') ? input.slice(1) : input;
    return SHORT_HEX_RE.test(hex)
        ? parseInt([...hex].map(c => c + c).join(''), 16)
        : LONG_HEX_RE.test(hex)
            ? parseInt(hex, 16)
            : undefined;
};
const removeOldRoles = async (member) => {
    await Promise.all(member.roles.cache
        .filter(isColourRole)
        .map(async (role) => role.members.size === 1 ? role.delete() : member.roles.remove(role)));
};
const set = async (interaction) => {
    const input = interaction.options.getString(COLOUR, true);
    const colour = parseColour(input);
    if (colour === undefined) {
        await interaction.reply({
            content: `Invalid colour ${inlineCode(input)}! Please use a hex colour or one of these: ${VALID_COLOURS}. Noot noot.`,
            ephemeral: true
        });
        return;
    }
    const guild = await fetchGuild(interaction);
    const member = await guild.members.fetch(interaction.user.id);
    const hexColour = `#${colour.toString(16).padStart(6, '0')}`;
    const newPosition = guild.roles.cache
        .filter(isColourRole)
        .sorted((a, b) => b.position - a.position)
        .find(({ name }) => name.localeCompare(hexColour) > 0)?.position;
    const role = guild.roles.cache.find(({ name }) => name === hexColour) ??
        (await guild.roles.create({
            name: hexColour,
            color: colour,
            permissions: 0n,
            position: newPosition === undefined
                ? guild.me?.roles.highest.position
                : newPosition + 1
        }));
    await removeOldRoles(member);
    await member.roles.add(role);
    await interaction.reply(`Set your colour to ${bold(hexColour)}.`);
};
const remove = async (interaction) => {
    await removeOldRoles(await (await fetchGuild(interaction)).members.fetch(interaction.user.id));
    await interaction.reply('Removed your colour.');
};
const command = {
    data: new SlashCommandBuilder()
        .setName('colour')
        .setDescription('Change your colour (using a role).')
        .addSubcommand(subcommand => subcommand
        .setName(ENABLE)
        .setDescription('Enable allowing users to change their colour.'))
        .addSubcommand(subcommand => subcommand
        .setName(DISABLE)
        .setDescription('Disable allowing users to change their colour.'))
        .addSubcommand(subcommand => subcommand
        .setName(SET)
        .setDescription('Set your colour.')
        .addStringOption(option => option
        .setName(COLOUR)
        .setDescription('The colour, e.g. ‘#abcdef’ or ‘red’. Run the command for more info.')
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName(REMOVE).setDescription('Remove your colour.')),
    guildOnly: true,
    async execute(interaction, database) {
        const subCommand = interaction.options.getSubcommand();
        const isEnable = subCommand === ENABLE;
        if (isEnable || subCommand === DISABLE) {
            const guild = await fetchGuild(interaction);
            if (!(await checkIfAdmin(interaction, guild)))
                return;
            if (isEnable && !(await checkPermissions(interaction, 'MANAGE_ROLES')))
                return;
            await setValue(database, 'guilds', guild.id, 'enableColourRoles', isEnable);
            await interaction.reply({
                content: `Successfully ${isEnable ? 'enabled' : 'disabled'}! Noot noot.`,
                ephemeral: true
            });
            return;
        }
        if (!((await fetchValue(database, 'guilds', interaction.guildId, 'enableColourRoles')) ?? false)) {
            await interaction.reply({
                content: 'You can’t change your colour in this server! Noot noot.',
                ephemeral: true
            });
            return;
        }
        if (!(await checkPermissions(interaction, 'MANAGE_ROLES')))
            return;
        await (subCommand === SET ? set : remove)(interaction);
    }
};
export default command;
//# sourceMappingURL=colour.js.map