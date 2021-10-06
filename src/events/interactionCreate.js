import { inlineCode } from '@discordjs/builders';
import { debugInteractionDetails, handleError } from '../utils.js';
const listener = (client, database) => async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;
        const command = client.slashCommands.get(commandName);
        if (!command) {
            handleError(client, new Error(`Command ${commandName} not found`));
            return;
        }
        if ((command.guildOnly ?? false) && !interaction.inGuild()) {
            handleError(client, new Error(`Command ${commandName} is guild only but interaction is not in a guild
${debugInteractionDetails(interaction)}`));
            return;
        }
        try {
            await command.execute(interaction, database);
        }
        catch (error) {
            handleError(client, error, `Command ${inlineCode(commandName)} failed
${debugInteractionDetails(interaction)}`, { to: interaction });
        }
    }
    else if (interaction.isContextMenu()) {
        const { commandName, targetType } = interaction;
        const command = (targetType === 'USER' ? client.userCommands : client.messageCommands).get(commandName);
        if (!command) {
            handleError(client, new Error(`Command ${commandName} not found`));
            return;
        }
        try {
            await command.execute(interaction, database);
        }
        catch (error) {
            handleError(client, error, `Command ${inlineCode(commandName)} failed
${debugInteractionDetails(interaction)}`, { to: interaction });
        }
    }
};
export default listener;
//# sourceMappingURL=interactionCreate.js.map