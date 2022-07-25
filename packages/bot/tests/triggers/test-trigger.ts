import type {Trigger} from '../../src/types'

export default (
	name: string,
	{regex}: Trigger,
	success: string[],
	fail: string[]
): void =>
	describe(name, () => {
		describe('regex', () => {
			describe('success', () =>
				test.each(success)('%s', string => expect(string).toMatch(regex)))
			describe('fail', () =>
				test.each(fail)('%s', string => expect(string).not.toMatch(regex)))
		})
	})
