import { inlineCode } from 'discord.js';
import * as D from 'discord.js';
export const upperFirst = (string) => string && string[0].toUpperCase() + string.slice(1);
export const screamingSnakeToStartCase = (string) => string.toLowerCase().split('_').map(upperFirst).join(' ');
export const pascalToStartCase = (string) => string.split(/(?=[A-Z\d])/u).join(' ');
export const splitMessage = (string, max = 2000) => {
    const go = (lines, acc = [], length = 0) => {
        if (!lines.length)
            return [];
        const [head, ...tail] = lines;
        const newLength = length + head.length + 1;
        return newLength > max
            ? [acc.join('\n'), ...go(tail)]
            : go(lines, [...acc, head], newLength);
    };
    return go(string.split('\n'));
};
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
    [D.ApplicationCommandOptionType.String]: 'string',
    [D.ApplicationCommandOptionType.Integer]: 'integer',
    [D.ApplicationCommandOptionType.Boolean]: 'boolean',
    [D.ApplicationCommandOptionType.User]: 'user',
    [D.ApplicationCommandOptionType.Channel]: 'channel',
    [D.ApplicationCommandOptionType.Role]: 'role',
    [D.ApplicationCommandOptionType.Mentionable]: 'mentionable',
    [D.ApplicationCommandOptionType.Number]: 'number',
    [D.ApplicationCommandOptionType.Attachment]: 'attachment'
};
export const formatCommandSyntax = ({ name, description, options = [] }, { prefix, includeDescription = false, pipeChar = '|' } = {}) => {
    const resolvedPrefix = prefix === undefined ? '' : `${prefix} `;
    const commandString = `/${resolvedPrefix}${name}`;
    const resolvedDescription = includeDescription ? `: ${description}` : '';
    return (inlineCode(commandString +
        (options.length
            ? ` ${options
                .map(opt => {
                const { required = false } = opt;
                return `${required ? '<' : '['}${opt.name}: ${'choices' in opt && opt.choices
                    ? opt.choices.map(choice => choice.name).join(pipeChar)
                    :
                        optionsToString[opt.type]}${required ? '>' : ']'}`;
            })
                .join(' ')}`
            : '')) + resolvedDescription);
};
export const formatCommandUsage = (usage, newline = '\n') => (usage === undefined ? '' : newline + newline + usage);
//# sourceMappingURL=format.js.map