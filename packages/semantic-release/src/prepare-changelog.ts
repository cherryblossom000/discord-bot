import {resolve} from 'node:path'
import resolveConfig from '@semantic-release/changelog/lib/resolve-config'
import {ensureFile, readFile, writeFile} from 'fs-extra'
import editNotes from './edit-notes'
import type {PluginWithNextRelease} from './types'

// https://github.com/semantic-release/changelog/blob/v6.0.1/lib/prepare.js#L5-L27
const prepareChangelog: PluginWithNextRelease = async (
	pluginConfig,
	{cwd, nextRelease: {notes}, logger}
) => {
	const {changelogFile, changelogTitle} = resolveConfig(pluginConfig)
	const changelogPath = resolve(cwd, changelogFile)

	if (notes) {
		await ensureFile(changelogPath)
		const currentFile = (await readFile(changelogPath)).toString().trim()
		logger.log(`${currentFile ? 'Update' : 'Create'} %s`, changelogPath)

		const currentContent =
			changelogTitle !== undefined &&
			changelogTitle !== '' &&
			currentFile.startsWith(changelogTitle)
				? currentFile.slice(changelogTitle.length).trim()
				: currentFile

		const content = `${editNotes(notes.trim())}\n${
			currentContent ? `\n${currentContent}\n` : ''
		}`

		await writeFile(
			changelogPath,
			(changelogTitle !== undefined && changelogTitle !== ''
				? `${changelogTitle}\n\n`
				: '') + content
		)
	}
}
export default prepareChangelog
