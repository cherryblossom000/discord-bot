import * as fs from 'fs'
import * as path from 'path'
import {fileURLToPath} from 'url'
import type {PackageJson} from 'type-fest'
import exitOnError, {exit} from './exit-on-error.js'
import type {} from './url'

exitOnError()

const {readFile, writeFile} = fs.promises

const botFolder = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  'packages',
  'bot'
)
readFile(path.join(botFolder, 'package.json'), 'utf8')
  .then(async string => {
    const package_ = JSON.parse(string) as PackageJson
    delete package_.devDependencies
    return writeFile(
      path.join(botFolder, 'dist', 'package.json'),
      `${JSON.stringify(package_, null, 2)}\n`
    )
  })
  .catch(exit)
