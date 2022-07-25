export const shuffle = <T>(collection: readonly T[]): readonly T[] => {
	const {length} = collection
	const array = [...collection]
	let i = -1
	while (++i < length) {
		const rand = i + Math.floor(Math.random() * (length - i))
		const value = array[rand]
		array[rand] = array[i]!
		array[i] = value!
	}
	return array
}

export const upperFirst = (string: string): string =>
	string && string[0]!.toUpperCase() + string.slice(1)

/* eslint-disable jsdoc/match-description -- bold */
/**
 * **NOTE:** This only splits the words based on underscores, which is all that
 * is currently needed.
 */
export const startCaseFromParts = (parts: readonly string[]): string =>
	parts.reduce(
		(result, word, index) => result + (index ? ' ' : '') + upperFirst(word),
		''
	)

/**
 * **NOTE:** This only splits the words based on underscores, which is all that
 * is currently needed.
 */
/* eslint-enable jsdoc/match-description */
export const startCase = (string: string): string =>
	startCaseFromParts(string.toLowerCase().split('_'))
