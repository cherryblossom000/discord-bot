import { PermissionFlagsBits } from 'discord.js';
export const dev = process.env.NODE_ENV !== 'production';
export const permissions = PermissionFlagsBits.ViewChannel |
    PermissionFlagsBits.SendMessages |
    PermissionFlagsBits.EmbedLinks |
    PermissionFlagsBits.AttachFiles;
export const me = '506054261717598210';
export const emojis = {
    left: '⬅',
    right: '➡',
    tick: '✅',
    cross: '❌',
    clock: '🕒',
    smirk: '😏',
    thumbsUp: '👍',
    anticlockwise: '⤴️',
    clockwise: '⤵️'
};
export const defaultTimeZone = 'UTC';
export const timeout = dev ? 5000 : 60000;
export const pinguNouns = [
    'bots?',
    'pingu',
    'communism',
    'communists?',
    'stalin',
    'ussr',
    'union of soviet socialist republics',
    'soviet(?:s)?(?: union)?'
];
export const copulas = ['is', 'are'];
export const articles = ['an?', 'the'];
export const adverbs = ['very', 'much', 'so', 'too', 'really', 'big(?:gest)?'];
export const badAdjectives = [
    'down',
    'not working',
    'offline',
    'stupid',
    'sto{2,}pid',
    'dumb',
    'annoying',
    'bad',
    'worst',
    'frustrating',
    'sucks?',
    'flawed',
    'shit',
    'stinke?y',
    'po{2,}(?:p(?:ie)?)?',
    'crap',
    'fu+ck(?: (?:yo)?u)?'
];
export const negative = ['not?', 'never'];
export const goodAdjectives = [
    'good',
    'amazing',
    'great',
    'lovely',
    'fast',
    'awesome'
];
//# sourceMappingURL=constants.js.map