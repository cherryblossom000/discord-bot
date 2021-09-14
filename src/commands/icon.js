import { checkPermissions } from '../utils.js';
const command = {
    name: 'icon',
    aliases: ['i'],
    description: 'Gets the server icon.',
    guildOnly: true,
    async execute(message) {
        if (!(await checkPermissions(message, 'ATTACH_FILES')))
            return;
        const icon = message.guild.iconURL();
        await message.sendDeletableMessage({
            content: icon === null
                ? 'This server doesn’t have an icon! Noot noot.'
                : { files: [icon] }
        });
    }
};
export default command;
//# sourceMappingURL=icon.js.map