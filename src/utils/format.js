import { inlineCode } from '@discordjs/builders';
import * as D from 'discord-api-types/v9';
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