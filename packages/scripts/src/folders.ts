/* eslint-disable jsdoc/require-description-complete-sentence -- paths */
/** `packages/scripts/` */
export const scriptsFolder = new URL('..', import.meta.url)
/** `packages/bot/` */
export const botFolder = new URL('../bot/', scriptsFolder)
/** `packages/bot/dist/` */
export const botDistFolder = new URL('dist/', botFolder)
/* eslint-enable jsdoc/require-description-complete-sentence */
