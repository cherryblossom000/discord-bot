import { inlineCode } from '@discordjs/builders';
export const createDateFormatter = (timeZone) => {
    const format = new Intl.DateTimeFormat('en-AU', {
        dateStyle: 'short',
        timeStyle: 'long',
        timeZone
    });
    return (date) => {
        const parts = format.formatToParts(date);
        const part = (type) => parts.find(p => p.type === type)?.value;
        return `${part('day')}/${part('month')}/${part('year')}, ${part('hour')}:${part('minute')} ${part('dayPeriod').toLowerCase()} ${part('timeZoneName') ?? 'GMT'}`;
    };
};
export const formatBoolean = (boolean) => boolean ?? false ? 'Yes' : 'No';
const optionsToString = {
    [3]: 'string',
    [4]: 'integer',
    [5]: 'boolean',
    [6]: 'user',
    [7]: 'channel',
    [8]: 'role',
    [9]: 'mentionable',
    [10]: 'number'
};
export const formatCommandSyntax = ({ name, description, options = [] }, { prefix, includeDescription = false, pipeChar = '|' } = {}) => {
    const resolvedPrefix = prefix === undefined ? '' : `${prefix} `;
    const commandString = `/${resolvedPrefix}${name}`;
    const resolvedDescription = includeDescription ? `: ${description}` : '';
    return (inlineCode(commandString +
        (options.length
            ? ` ${options
                .map(({ name: optName, required = false, type, choices }) => `${required ? '<' : '['}${optName}: ${choices?.map(choice => choice.name).join(pipeChar) ??
                optionsToString[type]}${required ? '>' : ']'}`)
                .join(' ')}`
            : '')) + resolvedDescription);
};
export const formatCommandUsage = (usage, newline = '\n') => (usage === undefined ? '' : newline + newline + usage);
//# sourceMappingURL=format.js.map