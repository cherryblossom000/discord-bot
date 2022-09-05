import { ApplicationCommandOptionType, SlashCommandBuilder, inlineCode } from 'discord.js';
import { commandFiles, formatCommandSyntax, formatCommandUsage, removeJSExtension } from '../../utils.js';
const HELP = 'help';
const COMMAND = 'command';
const optionFields = (command) => command.options?.map(opt => ({
    name: opt.name,
    value: opt.description
}));
const basicEmbed = (name, description, usage) => ({
    title: name,
    description: description + (usage === undefined ? '' : `\n${usage}`)
});
const subcommandEmbeds = (name, options) => options.map(subcommand => ({
    title: `${name} ${subcommand.name}`,
    description: formatCommandSyntax(subcommand, {
        prefix: name,
        includeDescription: true
    }),
    fields: optionFields(subcommand)
}));
let allCommands;
const command = {
    data: new SlashCommandBuilder()
        .setName(HELP)
        .setDescription('Lists all my commands or gets info about a specific command.')
        .addStringOption(option => option
        .setName(COMMAND)
        .setDescription('The command that you want to get info about. If omitted, all the commands will be listed.')
        .addChoices(...commandFiles.flatMap(filename => {
        const name = removeJSExtension(filename);
        return name === HELP ? [] : [{ name, value: name }];
    }))),
    async execute(interaction) {
        const { client: { slashCommands } } = interaction;
        const commandName = interaction.options.getString(COMMAND);
        if (commandName === null) {
            await interaction.reply({
                content: (allCommands ??= `Here’s a list of all my commands:
${slashCommands
                    .filter(({ hidden = false }) => !hidden)
                    .sorted(({ data: a }, { data: b }) => a.name.localeCompare(b.name))
                    .map(({ data: { name, description } }) => `\`${name}\`: ${description}`)
                    .join('\n')}
You can send ${inlineCode('/help [command name]')} to get info on a specific command. Noot noot.`),
                ephemeral: true
            });
            return;
        }
        const { data, usage } = slashCommands.get(commandName);
        const cmd = data.toJSON();
        const { name, description, options } = cmd;
        const embeds = options?.[0]?.type === ApplicationCommandOptionType.SubcommandGroup
            ? [
                basicEmbed(name, description, usage),
                ...options.flatMap(group => [
                    basicEmbed(group.name, group.description),
                    ...subcommandEmbeds(group.name, group.options)
                ])
            ]
            : options?.[0]?.type === ApplicationCommandOptionType.Subcommand
                ? [
                    basicEmbed(name, description, usage),
                    ...subcommandEmbeds(name, options)
                ]
                : [
                    {
                        title: name,
                        description: formatCommandSyntax(cmd, {
                            includeDescription: true
                        }) + formatCommandUsage(usage),
                        fields: optionFields(cmd)
                    }
                ];
        await interaction.reply({ embeds: embeds.slice(0, 10), ephemeral: true });
        if (embeds.length > 10) {
            await Promise.all(Array.from({ length: Math.ceil(embeds.length / 10) - 1 }, async (_, i) => interaction.followUp({
                embeds: embeds.slice(10 * (i + 1), 10 * (i + 2)),
                ephemeral: true
            })));
        }
    }
};
export default command;
//# sourceMappingURL=help.js.map