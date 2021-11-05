// https://github.com/discordjs/builders/issues/54
// ESM export of @discordjs/builders is broken
// - @discordjs/builders depends on ow, which is written in TypeScript and
//   compiled to CommonJS
// - Node.js does not treat __esModule like TypeScript does (which treats the
//   CommonJS file as if it's a real ESM one), so a double default import is
//   required to actually get the ow's default export:
//     import _ow from 'ow'
//     const ow = _ow.default
// - @discordjs/builders imports it normally though
// - This causes 'TypeError: cannot read property 'string' of undefined' in
//   @discordjs/builders
// ughhhhhh why is the JS/Node.JS ecosystem so broken

import {createRequire} from 'node:module'
import type DiscordJSBuilders from '@discordjs/builders'

const require = createRequire(import.meta.url)

export const {SlashCommandBuilder, bold, codeBlock, hyperlink, inlineCode} =
  require('@discordjs/builders') as typeof DiscordJSBuilders
