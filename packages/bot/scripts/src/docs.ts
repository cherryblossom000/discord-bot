import fs from 'fs'
import path from 'path'
import {Permissions} from 'discord.js'
import MarkdownIt from 'markdown-it'
import {markdownTable} from 'markdown-table'
import exitOnError, {exit} from '../../../../scripts/dist/exit-on-error.js'
// TODO: fix this
// @ts-ignore CommonJS module, default export is the module.exports
import _constants from '../../dist/src/constants.js'
// @ts-ignore see ^^
import _lodash from '../../dist/src/lodash.js'
import type * as constants from '../../src/constants'
import type * as lodash from '../../src/lodash'
import type {Command} from '../../src/types'
// eslint-disable-next-line import/max-dependencies -- due to hack for TS
import type {} from '../../../../scripts/src/url'

const {permissions} = _constants as typeof constants
const {upperFirst} = _lodash as typeof lodash

exitOnError()

const {mkdir, readFile, readdir, writeFile} = fs.promises

const scriptsFolder = path.dirname(path.dirname(import.meta.url))
const rootFolder = path.dirname(scriptsFolder)
const dist = path.join(rootFolder, 'dist')
const commandsFolder = path.join(dist, 'src', 'commands')
const htmlFolder = path.join(dist, 'assets', 'html')
const readmeURL = new URL(path.join(rootFolder, 'README.md'))

;(async (): Promise<void> => {
  // Update readme
  const files = await readdir(new URL(commandsFolder))
  const commands = await Promise.all(
    files
      .filter(f => f.endsWith('.js'))
      .map(
        async f =>
          (
            await ((await import(path.join(commandsFolder, f))) as Promise<{
              default: {default: Command}
            }>)
          ).default.default
      )
  )
  const usageMarkdownIt = new MarkdownIt({html: true, breaks: true})
  const docs = [
    ['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)'],
    ...commands
      .filter(({hidden = false}) => !hidden)
      .map(({name, aliases, description, syntax, usage, cooldown = 3}) => [
        `\`${name}\``,
        aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
        name === 'iwmelc'
          ? `${description}<br>![i will murder every last capitalist](./assets/img/iwmelc.jpg)`
          : name === 'htkb'
          ? `${description}<br>![how to kiss boy](./assets/img/htkb.jpg)`
          : description,
        `\`.${name}${
          syntax === undefined ? '' : ` ${syntax.replace(/\|/gu, '\\|')}`
        }\`${
          usage === undefined
            ? ''
            : `<br>${(name === 'play' || name === 'volume'
                ? usageMarkdownIt
                    .render(usage)
                    .replace(/\|/gu, '\\|')
                    .replace(/\n/gu, '')
                    .replace(/<\/?p>/gu, '')
                : usage
              ).replace(/\n/gu, '<br>')}`
        }`,
        cooldown.toString()
      ])
  ]

  const newReadme = (await readFile(readmeURL))
    .toString()
    .replace(
      /(?<=## Documentation\n\n)[\s\S]+(?=\n\n## Links)/u,
      markdownTable(docs, {alignDelimiters: false})
    )
    .replace(
      /(?<=permissions=)\d+/u,
      new Permissions(permissions).bitfield.toString()
    )

  await writeFile(readmeURL, newReadme)

  await mkdir(new URL(htmlFolder), {recursive: true})
  const template = (
    await readFile(new URL(path.join(scriptsFolder, 'template.html')))
  ).toString()

  const htmlMarkdownIt = new MarkdownIt({html: true})
  const writeHtml = async (
    p: string,
    title: string,
    description: string,
    _path: string,
    md: string
  ): Promise<void> =>
    writeFile(
      new URL(path.join(htmlFolder, `${p}.html`)),
      template
        .replace(/\[title\]/gu, title)
        .replace(/\[description\]/gu, description)
        .replace('[path]', _path)
        .replace('[content]', htmlMarkdownIt.render(md))
    )

  const writeOtherPage = async (
    htmlPath: string,
    mdPath: string
  ): Promise<void> => {
    const title = upperFirst(htmlPath)
    return writeHtml(
      htmlPath,
      `${title} - Comrade Pingu`,
      `${title} for Comrade Pingu`,
      `/${htmlPath}`,
      `${(await readFile(new URL(path.join(rootFolder, mdPath)))).toString()}
#### [← back](/)`
    )
  }

  // Update index.html
  await writeHtml(
    'index',
    'Comrade Pingu',
    'Kill all the capitalist scum!',
    '',
    newReadme
      // Replace the escaped pipe in play but not in volume
      .replace('\\|', '|')
      .replace(/\.\/assets\/img/gu, '')
      .replace('LICENSE', 'license')
      .replace('CHANGELOG.md', 'changelog')
  )
  // Update license.html and changelog.html
  await writeOtherPage('license', path.join('..', '..', 'LICENSE'))
  await writeOtherPage('changelog', 'CHANGELOG.md')
})().catch(exit)
