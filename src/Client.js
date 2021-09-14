import D, { Collection, MessageAttachment, MessageEmbed, Util, Structures } from 'discord.js';
import { emojis } from './constants.js';
import { upperFirst } from './lodash.js';
import { checkPermissions } from './utils.js';
export default class Client extends D.Client {
    constructor(...args) {
        Structures.extend('Message', _Message => class extends _Message {
            async reply(content, options) {
                return super.reply(...(this.guild
                    ? [content, options]
                    : Array.isArray(content) &&
                        content.length &&
                        !content.some(x => x instanceof MessageEmbed ||
                            x instanceof MessageAttachment)
                        ? [
                            [
                                upperFirst(Util.resolveString(content[0])),
                                ...content.slice(1)
                            ],
                            options
                        ]
                        : typeof content == 'object' && content && !options
                            ? [content]
                            : [upperFirst(Util.resolveString(content)), options]));
            }
            async sendDeletableMessage({ reply = false, content }) {
                if (this.guild &&
                    !(await checkPermissions(this, [
                        'ADD_REACTIONS',
                        'READ_MESSAGE_HISTORY'
                    ])))
                    return;
                const contentArgs = Array.isArray(content)
                    ? content
                    : [content];
                const msg = await (reply
                    ? this.reply(...contentArgs)
                    : this.channel.send(...contentArgs));
                await Promise.all((Array.isArray(msg) ? msg : [msg]).map(async (m) => {
                    await m.react(emojis.delete);
                    await m.awaitReactions(({ emoji }, { id }) => emoji.name === emojis.delete && id === this.author.id, { max: 1 });
                    await m.delete();
                }));
            }
        });
        super(...args);
        Object.defineProperty(this, "commands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "regexCommands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queues", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rejoinListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.commands = new Collection();
        this.regexCommands = new Collection();
        this.queues = new Collection();
        this.rejoinListeners = new Collection();
    }
    async setActivity() {
        await this.user.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, { type: 'WATCHING' });
    }
}
//# sourceMappingURL=Client.js.map