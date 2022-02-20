import { inlineCode } from '@discordjs/builders';
import Koa from 'koa';
import serve from 'koa-static';
import { Client } from './Client.js';
import { addListeners } from './commands/slash/rejoin.js';
import { dev } from './constants.js';
import { connect, fetchRejoinGuilds } from './database.js';
import { commandFiles, handleError, importFolder as utilsImportFolder } from './utils.js';
import 'dotenv/config';
const assetsFolder = new URL('../assets/', import.meta.url);
const app = new Koa();
app
    .use(async (ctx, next) => {
    const cleanedPath = ctx.path.replace(/^\/|\/$/gu, '');
    let redirected;
    switch (cleanedPath) {
        case 'index':
        case 'index.html':
            redirected = '/';
            break;
        case 'changelog.html':
            redirected = '/changelog';
            break;
        case 'license.html':
            redirected = '/license';
            break;
        default:
            return next();
    }
    ctx.status = 301;
    ctx.redirect(redirected);
})
    .use(serve(new URL('html/', assetsFolder).pathname, { extensions: ['html'] }))
    .use(serve(new URL('css/', assetsFolder).pathname))
    .use(serve(new URL('img/', assetsFolder).pathname));
const client = new Client({
    allowedMentions: { parse: ['roles', 'users'] },
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS'
    ]
});
if (dev) {
    process.on('unhandledRejection', reason => {
        throw reason instanceof Error ? reason : new Error(`${reason}`);
    });
}
else {
    process.on('unhandledRejection', reason => handleError(client, reason instanceof Error ? reason : new Error(`${reason}`), 'Uncaught promise rejection:'));
    process.on('uncaughtException', error => handleError(client, error, 'Uncaught exception:'));
}
const database = await connect(process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);
const importFolder = async (folderPath, fn, files) => {
    try {
        for (const [filename, mod] of await utilsImportFolder(import.meta.url, folderPath, files))
            fn(mod, filename);
    }
    catch (error) {
        handleError(client, error, `${inlineCode('importFolder')} failed with path ${inlineCode(folderPath)}.`);
    }
};
client.once('ready', async () => {
    client.setActivity();
    await fetchRejoinGuilds(database).forEach(({ _id, rejoinFlags }) => addListeners(client, client.guilds.cache.get(_id), database, rejoinFlags));
    console.log(`READY
  Users: ${client.users.cache.size}
  Channels: ${client.channels.cache.size}
  Guilds: ${client.guilds.cache.size}`);
});
await importFolder('events', (listener, name) => client.on(name, listener(client, database)));
const addContextMenuCommand = (collectionKey) => (command) => {
    ;
    client[collectionKey].set(command.name, command);
};
await Promise.all([
    importFolder('commands/slash', command => client.slashCommands.set(command.data.name, command), commandFiles),
    importFolder('commands/message', addContextMenuCommand('messageCommands')),
    importFolder('commands/user', addContextMenuCommand('userCommands')),
    importFolder('triggers', command => client.triggers.set(command.regex, command.message))
]);
const listener = app.listen(Number(process.env.PORT), () => {
    if (dev)
        console.log(`http://localhost:${listener.address().port}`);
});
await client.login();
//# sourceMappingURL=server.js.map