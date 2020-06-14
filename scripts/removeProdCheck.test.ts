import removeProdCheck from './removeProdCheck'

describe('removeProdCheck', () => {
  const e = (source: string, expected: string): void => {
    expect(removeProdCheck(source)).toBe(expected)
  }

  const prod = "process.env.NODE_ENV === 'production'"
  const dev = "process.env.NODE_ENV !== 'production'"
  ;[
    ['inline', prod, dev],
    ['prod var', 'prod', '!prod', `const prod = ${prod}\n`, '\n'],
    ['dev var', '!dev', 'dev', `const dev = ${dev}\n`, '\n']
  ].forEach(([name, _prod, _dev, prepend = '', prepExpected = '']) => {
    const tests = [
      ['if', (check: string, p: string, d: string): string => `if (${check}) ${p}
else ${d}`],
      ['conditional', (check: string, p: string, d: string): string => `${check} ? ${p} : ${d}`]
    ] as const
    test.each(tests)(`${name} %s prod`, (_, f) => e(prepend + f(_prod, 'p', 'd'), `${prepExpected}p`))
    test.each(tests)(`${name} %s dev`, (_, f, _p = '') => e(prepend + f(_dev, 'd', 'p'), `${prepExpected}p`))
  })

  test('non-checking variable', () => e('if (!x) a', 'if (!x) a'))
})
