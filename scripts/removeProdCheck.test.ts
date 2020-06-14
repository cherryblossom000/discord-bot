import removeProdCheck from './removeProdCheck'

describe('removeProdCheck', () => {
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
    test.each(tests)(`${name} %s prod`, (_, f) => expect(removeProdCheck(prepend + f(_prod, 'p', 'd'))).toBe(`${prepExpected}p`))
    test.each(tests)(`${name} %s dev`, (_, f, _p = '') => expect(removeProdCheck(prepend + f(_dev, 'd', 'p'))).toBe(`${prepExpected}p`))
  })
})
