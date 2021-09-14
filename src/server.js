import fs from 'node:fs';
import dotenv from 'dotenv';
import Koa from 'koa';
import serve from 'koa-static';
import Client from './Client.js';
import { addListeners } from './commands/rejoin.js';
import { dev } from './constants.js';
import { connect, fetchRejoinGuilds } from './database.js';
import { handleError } from './utils.js';
dotenv.config();
const { readdir } = fs.promises;
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
    disableMentions: 'everyone',
    ws: {
        intents: [
            'GUILDS',
            'GUILD_MEMBERS',
            'GUILD_EMOJIS',
            'GUILD_MESSAGE_REACTIONS',
            'GUILD_VOICE_STATES',
            'GUILD_PRESENCES',
            'GUILD_MESSAGES',
            'DIRECT_MESSAGES',
            'DIRECT_MESSAGE_REACTIONS'
        ]
    }
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
const importFolder = async (folderPath, callback) => {
    try {
        await Promise.all((await readdir(new URL(`${folderPath}/`, import.meta.url)))
            .filter(file => file.endsWith('.js'))
            .map(async (file) => callback((await import(new URL(`${folderPath}/${file}`, import.meta.url).pathname)).default, file.slice(0, -3))));
    }
    catch (error) {
        handleError(client, error, `\`importFolder\` failed with path \`${folderPath}\`.`);
    }
};
client.once('ready', async () => {
    await client.setActivity();
    await fetchRejoinGuilds(database).forEach(({ _id, rejoinFlags }) => addListeners(client, client.guilds.cache.get(_id), database, rejoinFlags));
    console.log(`READY
  Users: ${client.users.cache.size}
  Channels: ${client.channels.cache.size}
  Guilds: ${client.guilds.cache.size}`);
});
await importFolder('events', (listener, name) => client.on(name, listener(client, database)));
await Promise.all([
    importFolder('commands', c => client.commands.set(c.name, c)),
    importFolder('regex-commands', c => client.regexCommands.set(c.regex, c.regexMessage))
]);
const listener = app.listen(Number(process.env.PORT), () => {
    if (dev)
        console.log(`http://localhost:${listener.address().port}`);
});
await client.login(process.env.TOKEN);
//# sourceMappingURL=server.js.map