export const shuffle = (collection) => {
    const { length } = collection;
    const array = [...collection];
    let i = -1;
    while (++i < length) {
        const rand = i + Math.floor(Math.random() * (length - i));
        const value = array[rand];
        array[rand] = array[i];
        array[i] = value;
    }
    return array;
};
export const upperFirst = (string) => string && string[0].toUpperCase() + string.slice(1);
export const startCaseFromParts = (parts) => parts.reduce((result, word, index) => result + (index ? ' ' : '') + upperFirst(word), '');
export const startCase = (string) => startCaseFromParts(string.toLowerCase().split('_'));
//# sourceMappingURL=lodash.js.map