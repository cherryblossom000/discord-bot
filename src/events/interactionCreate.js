import { ApplicationCommandType, inlineCode, InteractionType } from 'discord.js';
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
        await command
            .execute(interaction, database)
            .catch(handleInteractionError(interaction));
    };
    return async (interaction) => {
        if (interaction.type === InteractionType.ApplicationCommand) {
            switch (interaction.commandType) {
                case ApplicationCommandType.ChatInput:
                    await runCommand(interaction, 'slashCommands');
                    break;
                case ApplicationCommandType.Message:
                    await runCommand(interaction, 'messageCommands');
                    break;
                case ApplicationCommandType.User:
                    await runCommand(interaction, 'userCommands');
            }
        }
    };
};
export default listener;
//# sourceMappingURL=interactionCreate.js.map