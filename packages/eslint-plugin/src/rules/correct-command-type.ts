import createTypeRule from '../create-type-rule'
export = createTypeRule(
  'command',
  new Set(['AnyCommand', 'GuildOnlyCommand']),
  '`AnyCommand` or `GuildOnlyCommand`'
)
