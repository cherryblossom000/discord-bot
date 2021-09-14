import { createRequire } from 'node:module';
import { inspect } from 'node:util';
import Discord from 'discord.js';
import escapeRegex from 'escape-string-regexp';
import { me } from '../constants.js';
const kDiscardResult = Symbol('discard result');
const AsyncFunction = (async () => { })
    .constructor;
const command = {
    name: 'eval',
    aliases: ['e'],
    cooldown: 0,
    description: 'Evaluates some JS.',
    args: 1,
    syntax: '<javascript>',
    usage: `\`javascript\`
The code to execute. The following variables are available:
- \`message: Discord.Message\`: The message you sent.
- \`input: {args: string[], input: string}\`: \`input.input\` is the sanitised input given to the command and \`input.args\` is the split \`input.input\` (the arguments).
- \`Discord: Discord\` The discord.js module.
- \`_: symbol\` Return this (for example using the comma operator) to make me not send the result.`,
    hidden: true,
    async execute(message, input, database) {
        const { author, channel } = message;
        if (author.id !== me) {
            await channel.send('This command can only be done by the bot owner!');
            return;
        }
        let result;
        try {
            result = await AsyncFunction('message', 'input', 'database', 'Discord', 'require', '_', `return (${input.input})`)(message, input, database, Discord, createRequire(import.meta.url), kDiscardResult);
        }
        catch (error) {
            await message.sendDeletableMessage({ content: [`${error}`, { code: true }] });
            return;
        }
        if (result !== kDiscardResult) {
            await message.sendDeletableMessage({
                content: [
                    ['TOKEN', 'DB_USER', 'DB_PASSWORD', 'REPLIT_DB_URL'].reduce((acc, key) => {
                        const value = process.env[key];
                        return value === undefined
                            ? acc
                            : acc.replace(new RegExp(escapeRegex(value), 'ug'), `<${key}>`);
                    }, inspect(result)),
                    { code: 'js', split: true }
                ]
            });
        }
    }
};
export default command;
//# sourceMappingURL=eval.js.map