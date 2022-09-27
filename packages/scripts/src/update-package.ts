import {readFile, writeFile} from 'node:fs/promises'
import exitOnError from './exit-on-error.js'
import {botFolder, botDistFolder} from './folders.js'
import type {PackageJson} from 'type-fest'

exitOnError()

const package_ = JSON.parse(
	await readFile(new URL('package.json', botFolder), 'utf8')
) as PackageJson
// Repl.it only has v16.7 which doesn't have Object.hasOwn which discord.js needs
package_.dependencies!.node = '^16.17.0'
await writeFile(
	new URL('package.json', botDistFolder),
	`${JSON.stringify(package_, null, 2)}\n`
)
