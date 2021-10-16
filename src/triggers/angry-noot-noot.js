import { adverbs as _adverbs, articles, badAdjectives, copulas, goodAdjectives, negative, pinguNouns } from '../constants.js';
const alternate = (strings) => `(?:${strings.join('|')})`;
const alternateS = (...strings) => alternate(strings);
const nouns = alternate(pinguNouns);
const adverbs = alternate(_adverbs);
const adjectives = alternate(badAdjectives);
const bad = alternateS(adjectives, `${alternate(negative)} ${adverbs}? ${alternate(goodAdjectives)}`);
const adjLast = `(?:${nouns} ${alternate(copulas)}?(?: (?:${alternate(articles)}))? ${adverbs}? ${bad})`;
const adjFirst = `(${bad} ${nouns})`;
const regex = new RegExp(alternateS(adjLast, adjFirst).replace(/\s+/gu, '\\s*'), 'ui');
const trigger = {
    regex,
    message: 'Noot noot!'
};
export default trigger;
//# sourceMappingURL=angry-noot-noot.js.map