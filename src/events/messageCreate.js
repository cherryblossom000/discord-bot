import { ChannelType, inlineCode } from 'discord.js';
import { handleError } from '../utils.js';
const listener = client => async (message) => {
    const { author, content, channel } = message;
    if (author.bot)
        return;
    if (content.trim().startsWith(`<@!${client.user.id}>`)) {
        try {
            await channel.send(`Hi, I am Comrade Pingu. Noot noot.
    I use slash commands now — type ${inlineCode('/')} to see my commands.`);
        }
        catch (error) {
            handleError(client, error, `Responding to mention failed in channel ${channel.id}${channel.type === ChannelType.DM
                ? ''
                : ` (#${channel.name}) (guild ${channel.guild.id} (${channel.guild.name}))`}.`);
        }
        return;
    }
    for (const [regex, triggerMessage] of client.triggers.entries()) {
        if (regex.test(content)) {
            try {
                await (typeof triggerMessage === 'string'
                    ? channel.send(triggerMessage)
                    : channel.send(await triggerMessage(message)));
                return;
            }
            catch (error) {
                handleError(client, error, `Trigger with regex ${inlineCode(String(regex))} failed with message content ${inlineCode(content)}.`);
            }
        }
    }
};
export default listener;
//# sourceMappingURL=messageCreate.js.map