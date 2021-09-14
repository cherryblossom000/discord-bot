import { readFile } from 'node:fs/promises';
const { version } = JSON.parse(await readFile(new URL('../../package.json', import.meta.url).pathname, 'utf8'));
const command = {
    name: 'info',
    aliases: ['in'],
    description: 'Gets info about me.',
    async execute({ channel }) {
        await channel.send(`Version: \`${version}\`
I am comrade Pingu. Noot noot.
Kill all the capitalist scum!
I was created by cherryblossom#2661.`);
    }
};
export default command;
//# sourceMappingURL=info.js.map