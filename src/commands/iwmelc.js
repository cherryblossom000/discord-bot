import { imagesFolder } from '../constants.js';
import { checkPermissions } from '../utils.js';
const filePath = new URL('iwmelc.jpg', imagesFolder).pathname;
const command = {
    name: 'iwmelc',
    aliases: ['iwillmurdereverylastcapitalist'],
    description: 'Gets the meme that shows that ‘noot noot’ in Pingu means ‘i will murder every last capitalist’ in English.',
    async execute(message) {
        if (message.guild && !(await checkPermissions(message, 'ATTACH_FILES')))
            return;
        await message.channel.send({ files: [filePath] });
    }
};
export default command;
//# sourceMappingURL=iwmelc.js.map