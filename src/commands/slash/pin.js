import { SlashCommandBuilder } from '@discordjs/builders';
import { setValue } from '../../database.js';
import { checkIfAdmin, checkPermissions, fetchGuild } from '../../utils.js';
const ENABLE = 'enable';
const DISABLE = 'disable';
const command = {
    data: new SlashCommandBuilder()
        .setName('pin')
        .setDescription('Manage settings for the ‘Pin Message’ command.')
        .addSubcommand(subcommand => subcommand
        .setName(ENABLE)
        .setDescription('Enable allowing anyone to pin a message.'))
        .addSubcommand(subcommand => subcommand
        .setName(DISABLE)
        .setDescription('Disable allowing anyone to pin a message.')),
    guildOnly: true,
    async execute(interaction, database) {
        const subCommand = interaction.options.getSubcommand();
        const isEnable = subCommand === ENABLE;
        const guild = await fetchGuild(interaction);
        if (!(await checkIfAdmin(interaction, guild)))
            return;
        if (isEnable && !(await checkPermissions(interaction, 'MANAGE_MESSAGES')))
            return;
        await setValue(database, 'guilds', guild.id, 'enablePinning', isEnable);
        await interaction.reply({
            content: `Successfully ${isEnable ? 'enabled' : 'disabled'}! Noot noot.`,
            ephemeral: true
        });
    }
};
export default command;
//# sourceMappingURL=pin.js.map