import { inlineCode } from '@discordjs/builders';
import { debugInteractionDetails, handleError } from '../utils.js';
const handleInteractionError = (interaction) => (error) => handleError(interaction.client, error, `Command ${inlineCode(interaction.commandName)} failed
${debugInteractionDetails(interaction)}`, { to: interaction });
const listener = (client, database) => {
    const runCommand = async (interaction, key) => {
        const { commandName } = interaction;
        const command = client[key].get(commandName);
        if (!command) {
            handleError(client, new Error(`Command ${commandName} not found`));
            return;
        }
        if ((command.guildOnly ?? false) && !interaction.inGuild()) {
            await interaction.reply({
                content: 'This command is only available in servers! Noot noot.',
                ephemeral: true
            });
            return;
        }
        await command
            .execute(interaction, database)
            .catch(handleInteractionError(interaction));
    };
    return async (interaction) => {
        if (interaction.isCommand())
            await runCommand(interaction, 'slashCommands');
        else if (interaction.isMessageContextMenu())
            await runCommand(interaction, 'messageCommands');
        else if (interaction.isUserContextMenu())
            await runCommand(interaction, 'userCommands');
    };
};
export default listener;
//# sourceMappingURL=interactionCreate.js.map