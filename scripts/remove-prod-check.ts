import {join} from 'path'
import {promises, statSync} from 'fs'
import exitOnError from './exitOnError'
import removeProdCheck from './removeProdCheck'

const {readdir, readFile, writeFile} = promises

exitOnError()

/**
 * Walks a directory.
 * @param path The full path to the directory.
 * @returns A list of all the files inside the directory and all subdirectories.
 */
const walk = async (path: string): Promise<string[]> => {
  const files = (await readdir(path)).map(file => join(path, file))
  ;(await Promise.all(files
    .filter(file => statSync(file).isDirectory())
    .map(async file => walk(file)))
  ).forEach(subFiles => files.push(...subFiles))
  return files
}

walk(join(__dirname, '../dist/src'))
  .then(async files => {
    await Promise.all(files
      .filter(file => file.endsWith('.js'))
      .map(async file => {
        const source = await readFile(file)
        await writeFile(file, removeProdCheck(source.toString()))
      }))
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
