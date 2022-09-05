import { Colors, SlashCommandBuilder, bold, inlineCode } from 'discord.js';
import { fetchValue } from '../../database.js';
import { checkPermissions, fetchGuild, inObject } from '../../utils.js';
const SET = 'set';
const COLOUR = 'colour';
const REMOVE = 'remove';
const SHORT_HEX_RE = /^[\da-f]{3}$/iu;
const LONG_HEX_RE = /^[\da-f]{6}$/iu;
const ROLE_RE = /^#[\da-f]{6}$/u;
const isColourRole = ({ name }) => ROLE_RE.test(name);
const COLOURS = {
    ...Colors,
    DISCORD_DARK_BACKGROUND: 0x36393f
};
const VALID_COLOURS = Object.keys(COLOURS)
    .map(c => inlineCode(c.toLowerCase().replaceAll('_', ' ')))
    .join(', ');
const parseColour = (string) => {
    const input = string.toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
    if (inObject(COLOURS, input))
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
                ? guild.members.me?.roles.highest.position
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
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
        .setName(SET)
        .setDescription('Set your colour.')
        .addStringOption(option => option
        .setName(COLOUR)
        .setDescription('The colour, e.g. ‘#abcdef’ or ‘red’.')
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName(REMOVE).setDescription('Remove your colour.')),
    usage: `You can use a hex colour or one of ${VALID_COLOURS}.`,
    async execute(interaction, database) {
        if (!((await fetchValue(database, 'guilds', interaction.guildId, 'enableColourRoles')) ?? false)) {
            await interaction.reply({
                content: 'You can’t change your colour in this server! Noot noot.',
                ephemeral: true
            });
            return;
        }
        if (!(await checkPermissions(interaction, ['ManageRoles'])))
            return;
        await (interaction.options.getSubcommand() === SET ? set : remove)(interaction);
    }
};
export default command;
//# sourceMappingURL=colour.js.map