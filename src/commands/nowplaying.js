import { getQueue } from '../utils.js';
const command = {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Gets the song currently playing.',
    guildOnly: true,
    async execute(message) {
        const queue = await getQueue(message, true);
        if (!queue)
            return;
        const [{ title, author, id }] = queue.songs;
        await message.channel.send(`Now playing **${title}** by ${author} (${id}).`);
    }
};
export default command;
//# sourceMappingURL=nowplaying.js.map