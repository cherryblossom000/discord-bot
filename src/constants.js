export const dev = process.env.NODE_ENV !== 'production';
export const defaultPrefix = '.';
export const permissions = [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'ADD_REACTIONS',
    'CONNECT',
    'SPEAK'
];
export const me = '506054261717598210';
const numbers = [];
for (let i = 0; i <= 9; i++)
    numbers.push(`${i}\uFE0F\u20E3`);
numbers.push('🔟');
export const emojis = {
    left: '⬅',
    right: '➡',
    pause: '⏸',
    resume: '▶',
    stop: '🛑',
    numbers,
    delete: '🗑',
    letters: ['🇦', '🇧', '🇨', '🇩'],
    tick: '✅',
    cross: '❌',
    clock: '🕒',
    smirk: '😏'
};
export const defaultTimeZone = 'UTC';
export const imagesFolder = new URL('assets/img/', import.meta.url);
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