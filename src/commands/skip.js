import { getQueue } from '../utils.js';
const command = {
    name: 'skip',
    aliases: ['sk'],
    description: 'Skips the current song.',
    guildOnly: true,
    async execute(message) {
        const queue = await getQueue(message, true);
        if (!queue)
            return;
        queue.connection.dispatcher.end();
        await message.channel.send(`Skipped **${queue.songs[0].title}**.`);
    }
};
export default command;
//# sourceMappingURL=skip.js.map