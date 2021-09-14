import { permissions } from '../constants.js';
const command = {
    name: 'invite',
    aliases: ['add', 'inv', 'link'],
    description: 'Gets my invite link.',
    async execute({ client, channel }) {
        await channel.send(await client.generateInvite(permissions));
    }
};
export default command;
//# sourceMappingURL=invite.js.map