import { fetchTimeZone, setValue } from '../database.js';
const command = {
    name: 'timezone',
    aliases: ['tz'],
    description: 'Manages time zone preferences.',
    syntax: '[timezone]',
    usage: `\`timezone\` (optional)
An IANA time zone (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) to use for commands such as \`profile\` that show the times. Spaces will be automatically converted into underscores. The default is \`UTC\`.
If omitted, shows the currently set timezone.`,
    async execute(message, { input }, database) {
        if (!input) {
            await message.reply(`your current time zone is set to ${await fetchTimeZone(database, message.author)}.`);
            return;
        }
        const timeZone = input.replaceAll(' ', '_');
        try {
            new Date().toLocaleString(undefined, { timeZone });
        }
        catch (error) {
            if (error instanceof RangeError) {
                await message.reply(`\`${timeZone}\` is not a valid time zone!`);
                return;
            }
        }
        await setValue(database, 'users', message.author, 'timeZone', timeZone);
        await message.reply(`successfully changed time zone to \`${timeZone}\`.`);
    }
};
export default command;
//# sourceMappingURL=timezone.js.map