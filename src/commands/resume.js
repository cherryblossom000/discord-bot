import { emojis } from '../constants.js';
import { getQueue, hasPermissions } from '../utils.js';
export const resume = async (dispatcher, message) => {
    dispatcher.resume();
    await (hasPermissions(message, 'READ_MESSAGE_HISTORY')
        ? message.react(emojis.resume)
        : message.channel.send(`Resumed the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`));
};
const command = {
    name: 'resume',
    aliases: ['r', 'unpause'],
    description: 'Resumes the song currently playing.',
    guildOnly: true,
    async execute(message) {
        const queue = await getQueue(message);
        if (!queue)
            return;
        await resume(queue.connection.dispatcher, message);
    }
};
export default command;
//# sourceMappingURL=resume.js.map