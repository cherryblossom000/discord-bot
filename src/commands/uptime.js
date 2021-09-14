import ms from 'ms';
const command = {
    name: 'uptime',
    aliases: ['up'],
    description: 'Gets my uptime.',
    async execute({ client, channel }) {
        await channel.send(`Uptime: ${ms(client.uptime)}`);
    }
};
export default command;
//# sourceMappingURL=uptime.js.map