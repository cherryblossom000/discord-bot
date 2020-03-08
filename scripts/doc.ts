import fs, {writeFileSync} from 'fs'
import {join} from 'path'
import {promisify} from 'util'
import MarkdownIt from 'markdown-it'
import table from 'markdown-table'
import type {PinguCommand} from '../src/types'

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

const commandsPath = join(__dirname, '../dist/src/commands')
const readmePath = join(__dirname, '../README.md')
const indexHtmlPath = join(__dirname, '../assets/index.html')
const licenseHtmlPath = join(__dirname, '../assets/license.html')
const changelogHtmlPath = join(__dirname, '../assets/changelog.html')

const replaceInFile = async (path: string, content: Promise<Buffer>, pattern: RegExp, text: string): Promise<string> => {
  const result = (await content).toString().replace(pattern, text)
  writeFileSync(path, result)
  return result
}

;(async (): Promise<void> => {
  const readme = readFile(readmePath)
  const indexHtml = readFile(indexHtmlPath)
  const licenseHtml = readFile(licenseHtmlPath)
  const changelogHtml = readFile(changelogHtmlPath)
  const license = readFile(join(__dirname, '../LICENSE'))
  const changelog = readFile(join(__dirname, '../CHANGELOG.md'))

  const files = await readdir(commandsPath)
  const modules = await Promise.all(files
    .filter(f => !f.endsWith('.map'))
    .map(async f => import(join(commandsPath, f)))
  )
  const commands = modules.map<PinguCommand>(m => m.default)
  const generatedDocs = [['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)']]
    .concat(commands.map(
      ({name, aliases, description, syntax, usage, cooldown = 3}) => [
          `\`${name}\``,
          aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
          name === 'iwmelc' ? `${description}![i will murder every last capitalist](./assets/iwmelc.jpg)` : description,
          `\`.${name}${syntax ? ` ${syntax}` : ''}\`${usage ? `<br>${usage.replace(/\n/g, '<br>')}` : ''}`,
          cooldown.toString()
      ]
    ))

  // update readme
  const readmeMd = replaceInFile(readmePath, readme, /(?<=## Documentation\n)[\s\S]+(?=\n\n## Links)/, table(generatedDocs))

  // update index.html
  replaceInFile(
    indexHtmlPath,
    indexHtml,
    /(?<=<body class="markdown-body">)[\s\S]+(?=<\/body>)/,
    new MarkdownIt({html: true}).render((await readmeMd)
      .replace('./assets', '')
      .replace('LICENSE', 'license')
      .replace('CHANGELOG.md', 'changelog')
    )
  )

  // update license.html
  replaceInFile(
    licenseHtmlPath,
    licenseHtml,
    /(?<=<body class="markdown-body">)[\s\S]+(?=<\/body>)/,
    new MarkdownIt({html: true}).render((await license).toString())
  )

  // update changelog.html
  replaceInFile(
    changelogHtmlPath,
    changelogHtml,
    /(?<=<body class="markdown-body">)[\s\S]+(?=<\/body>)/,
    new MarkdownIt({html: true}).render((await changelog).toString())
  )
})()
