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
const htmlPath = join(__dirname, '../assets/index.html')

const replaceInFile = async (path: string, content: Promise<Buffer>, pattern: RegExp, text: string): Promise<string> => {
  const result = (await content).toString().replace(pattern, text)
  writeFileSync(path, result)
  return result
}

;(async (): Promise<void> => {
  const readme = readFile(readmePath)
  const html = readFile(htmlPath)
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
            description,
            `\`.${name}${syntax ? ` ${syntax}` : ''}\`${usage ? `<br>${usage.replace(/\n/g, '<br>')}` : ''}`,
            cooldown.toString()
      ]
    ))
  const md = replaceInFile(readmePath, readme, /(?<=## Documentation\n)[\s\S]+(?=\n\n## Links)/, table(generatedDocs))
  replaceInFile(htmlPath, html, /(?<=<body>)[\s\S]+(?=<\/body>)/, new MarkdownIt({html: true}).render(await md))
})()
