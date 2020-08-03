import createTypeRule from '../create-type-rule'

// TODO [eslint-plugin-import@>2.22.0]: Refactor to export = createTypeRule('command', 'Command')
const rule = createTypeRule('command', 'Command')
export = rule
