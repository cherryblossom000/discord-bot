import * as fs from 'fs'
import type {PackageJson} from 'type-fest'
import exitOnError, {exit} from './exit-on-error.js'
import type {} from './url'

exitOnError()

const {readFile, writeFile} = fs.promises

const botFolder = new URL('../../packages/bot/', import.meta.url)
readFile(new URL('package.json', botFolder), 'utf8')
  .then(async string => {
    const package_ = JSON.parse(string) as PackageJson
    delete package_.devDependencies
    return writeFile(
      new URL('dist/package.json', botFolder),
      `${JSON.stringify(package_, null, 2)}\n`
    )
  })
  .catch(exit)
