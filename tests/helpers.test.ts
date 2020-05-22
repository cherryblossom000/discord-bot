import {createResolve} from '../src/helpers'

describe('Helpers', () => {
  test('createResolve', () => expect(createResolve('dirname')('path')).toBe('dirname/path'))
})
