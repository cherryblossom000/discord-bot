import {readdir} from 'node:fs/promises'

const readJSFiles = async (
	path: string,
	base: URL | string = import.meta.url
): Promise<readonly string[]> =>
	(await readdir(new URL(`${path}/`, base))).filter(file =>
		file.endsWith('.js')
	)

export const removeJSExtension = (filename: string): string =>
	filename.slice(0, -3)

export const importFolder = async <T>(
	base: URL | string,
	folderPath: string,
	files?: readonly string[]
): Promise<readonly (readonly [string, T])[]> =>
	Promise.all(
		(files ?? (await readJSFiles(folderPath, base))).map(
			async filename =>
				[
					removeJSExtension(filename),
					(
						(await import(
							new URL(`${folderPath}/${filename}`, base).pathname
						)) as {
							default: T
						}
					).default
				] as const
		)
	)

export const commandFiles = await readJSFiles('../commands/slash')
