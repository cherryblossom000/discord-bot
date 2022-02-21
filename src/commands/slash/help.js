import { SlashCommandBuilder, inlineCode } from '@discordjs/builders';
import { commandFiles, formatCommandSyntax, formatCommandUsage, removeJSExtension } from '../../utils.js';
const HELP = 'help';
const COMMAND = 'command';
const optionFields = (command) => command.options?.map(opt => ({
    name: opt.name,
    value: opt.description
}));
let allCommands;
const command = {
    data: new SlashCommandBuilder()
        .setName(HELP)
        .setDescription('Lists all my commands or gets info about a specific command.')
        .addStringOption(option => option
        .setName(COMMAND)
        .setDescription('The command that you want to get info about. If omitted, all the commands will be listed.')
        .addChoices(commandFiles.flatMap(filename => {
        const name = removeJSExtension(filename);
        return name === HELP ? [] : [[name, name]];
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
        const hasSubcommands = options?.[0]?.type === 1;
        await interaction.reply({
            embeds: [
                {
                    title: name,
                    description: hasSubcommands
                        ? description + (usage === undefined ? '' : `\n${usage}`)
                        : formatCommandSyntax(cmd, {
                            includeDescription: true
                        }) + formatCommandUsage(usage),
                    fields: hasSubcommands ? undefined : optionFields(cmd)
                },
                ...(hasSubcommands
                    ?
                        options.map(c => ({
                            title: `${name} ${c.name}`,
                            description: formatCommandSyntax(c, {
                                prefix: name,
                                includeDescription: true
                            }) + formatCommandUsage(usage),
                            fields: optionFields(c)
                        }))
                    : [])
            ],
            ephemeral: true
        });
    }
};
export default command;
//# sourceMappingURL=help.js.map