import { Collection } from 'discord.js';
import escapeRegex from 'escape-string-regexp';
import { dev } from '../constants.js';
import { fetchPrefix } from '../database.js';
import { handleError, ignoreError } from '../utils.js';
const executeRegexCommands = async (message) => {
    const { client, channel, content } = message;
    for (const [regex, regexMessage] of client.regexCommands.entries()) {
        if (regex.test(content)) {
            try {
                await (typeof regexMessage === 'string'
                    ? channel.send(regexMessage)
                    : channel.send(regexMessage(message)));
                return;
            }
            catch (error) {
                handleError(client, error, `Regex command with regex \`${regex}\` failed with message content \`${content}\`.`, message);
            }
        }
    }
};
const cooldowns = new Collection();
const listener = (client, database) => async (message) => {
    const now = Date.now();
    const { author, content, channel, guild } = message;
    if (author.bot)
        return;
    const prefix = await fetchPrefix(database, guild);
    const matchedPrefix = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`, 'u').exec(content)?.[0];
    if (matchedPrefix !== undefined || !guild) {
        const rawInput = content.slice(matchedPrefix?.length ?? 0).trim();
        if (!rawInput.length && matchedPrefix !== prefix) {
            await channel.send(`Hi, I am Comrade Pingu. Noot noot.
My prefix is \`${prefix}\`. Run \`${prefix}help\` for a list of commands.`);
            return;
        }
        const args = rawInput.split(/\s+/u);
        const commandName = args.shift().toLowerCase();
        const checkCommand = async (command) => {
            if (!command) {
                if (!guild)
                    await executeRegexCommands(message);
                return false;
            }
            const { name, args: noArgs = 0, syntax, guildOnly = false } = command;
            if (guildOnly && channel.type !== 'text') {
                await message.sendDeletableMessage({
                    reply: true,
                    content: 'sorry, I can’t execute that command inside DMs. Noot noot.'
                });
                return false;
            }
            if (args.length < noArgs) {
                await message.sendDeletableMessage({
                    reply: true,
                    content: `you didn’t provide enough arguments.
The syntax is: \`${prefix}${name}${syntax === undefined ? '' : ` ${syntax}`}\`. Noot noot.`
                });
                return false;
            }
            return true;
        };
        const command = client.commands.get(commandName) ??
            client.commands.find(({ aliases = [] }) => aliases.includes(commandName));
        if (!(await checkCommand(command)))
            return;
        if (!dev) {
            const checkCooldowns = async () => {
                if (!cooldowns.has(command.name))
                    cooldowns.set(command.name, new Collection());
                const timestamps = cooldowns.get(command.name);
                const cooldownAmount = (command.cooldown ?? 3) * 1000;
                if (timestamps.has(author.id)) {
                    const expirationTime = timestamps.get(author.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                        const msg = await message.reply(`please wait ${timeLeft} more second${timeLeft === '1.0' ? '' : 's'} before using the \`${command.name}\` command. Noot noot.`);
                        client.setTimeout(async () => {
                            await msg.delete();
                            await message.delete().catch(ignoreError('MISSING_PERMISSIONS'));
                        }, 5000);
                        return false;
                    }
                }
                timestamps.set(author.id, now);
                client.setTimeout(() => timestamps.delete(author.id), cooldownAmount);
                return true;
            };
            if (!(await checkCooldowns()))
                return;
        }
        const input = rawInput.replace(new RegExp(`^${commandName}\\s*`, 'u'), '');
        try {
            await command.execute(message, { args, input }, database);
        }
        catch (error) {
            handleError(client, error, `Command \`${command.name}\` failed${input ? ` with input ${input}` : ''}.`, message);
        }
    }
    else
        await executeRegexCommands(message);
};
export default listener;
//# sourceMappingURL=message.js.map