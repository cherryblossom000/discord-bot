import AngryNootNoot from '../../src/regex-commands/angry-noot-noot'

describe('angry-noot-noot', () => {
  describe('regex', () => {
    const {regex} = AngryNootNoot
    ;[
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
