import { emojis } from '../constants.js';
import { getQueue, hasPermissions } from '../utils.js';
const command = {
    name: 'stop',
    aliases: ['s'],
    description: 'Stops playing music.',
    guildOnly: true,
    async execute(message) {
        const queue = await getQueue(message);
        if (!queue)
            return;
        queue.voiceChannel.leave();
        message.client.queues.delete(message.guild.id);
        await (hasPermissions(message, 'READ_MESSAGE_HISTORY')
            ? message.react(emojis.stop)
            : message.channel.send(`Stopped the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`));
    }
};
export default command;
//# sourceMappingURL=stop.js.map