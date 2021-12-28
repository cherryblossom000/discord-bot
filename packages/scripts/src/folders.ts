// TODO [@discordjs/rest@>0.2.0-canary.0]: remove once
// https://github.com/discordjs/discord.js-modules/pull/97 is merged
// eslint-disable-next-line @typescript-eslint/no-shadow -- ^
import {URL} from 'node:url'

/* eslint-disable jsdoc/require-description-complete-sentence -- paths */
/** `packages/scripts/` */
export const scriptsFolder = new URL('..', import.meta.url)
/** `packages/bot/` */
export const botFolder = new URL('../bot/', scriptsFolder)
/** `packages/bot/dist/` */
export const botDistFolder = new URL('dist/', botFolder)
/* eslint-enable jsdoc/require-description-complete-sentence */
