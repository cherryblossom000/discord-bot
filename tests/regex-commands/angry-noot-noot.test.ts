import rewire from 'rewire'

const regex = rewire('../../dist/src/regex-commands/angry-noot-noot').__get__<RegExp>('regex')

describe('angry-noot-noot', () => {
  describe('regex', () => {
    [
      'pingu is bad',
      'pingu bad',
      'pingu is very bad',
      'pingu is not good',
      'pingu is not very good',
      'bad pingu',
      'very bad pingu',
      'not good pingu',
      'pingu sucks',
      'pingu  really  sucks'
    ].forEach(string => test(string, () => {
      expect(regex.test(string)).toBe(true)
    }))
    ;['good pingu', 'pingu', 'pingu is good', 'pingu is very good'].forEach(string => test(string, () => {
      expect(regex.test(string)).toBe(false)
    }))
  })
})
