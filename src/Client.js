import D, { ActivityType, Collection } from 'discord.js';
export class Client extends D.Client {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "slashCommands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Collection()
        });
        Object.defineProperty(this, "messageCommands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Collection()
        });
        Object.defineProperty(this, "userCommands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Collection()
        });
        Object.defineProperty(this, "triggers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Collection()
        });
        Object.defineProperty(this, "rejoinListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Collection()
        });
    }
    setActivity() {
        this.user.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, { type: ActivityType.Watching });
    }
}
//# sourceMappingURL=Client.js.map