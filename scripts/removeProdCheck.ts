import {ancestor} from 'acorn-walk'
import {parse} from 'acorn'
import type {
  BinaryExpression, ConditionalExpression, Expression, Identifier, IfStatement,
  Statement, UnaryExpression, VariableDeclarator, VariableDeclaration
} from 'estree'

/**
 * Removes checks in code if the code is running in a production environment.
 * @param source The code.
 * @returns The new code.
 */
export default (source: string): string => {
  /** Checks if a node is `process.node.NODE_ENV`. */
  const isNodeEnv = (node: Expression): boolean => node.type === 'MemberExpression' && !node.computed &&
    node.object.type === 'MemberExpression' && !node.object.computed &&
    node.object.object.type === 'Identifier' && node.object.object.name === 'process' &&
    (node.object.property as Identifier).name === 'env' &&
    (node.property as Identifier).name === 'NODE_ENV'

  /** Checks if an expression is `'production'`. */
  const isProduction = (node: Expression): boolean => node.type === 'Literal' && node.value === 'production'

  /** Checks if a binary expression is checking if it's production. */
  const binExpCheckingProd = (node: BinaryExpression): boolean => ['==', '!=', '===', '!=='].includes(node.operator) &&
    (isNodeEnv(node.left) && isProduction(node.right) || isNodeEnv(node.right) && isProduction(node.left))

  interface Negation extends UnaryExpression {
    operator: '!'
  }
  /** Checks if an expression is a negation. */
  const isNeg = (node: Expression): node is Negation => node.type === 'UnaryExpression' && node.operator === '!'

  interface UnaryBinaryExpression extends Negation {
    argument: BinaryExpression
  }
  /** Checks if an expression is negating a binary expression. */
  const isBinNeg = (node: Expression): node is UnaryBinaryExpression => isNeg(node) && node.argument.type === 'BinaryExpression'

  /** Checks if an expression is checking if it's production. */
  const isCheckingProd = (node: Expression): node is BinaryExpression | UnaryBinaryExpression =>
    node.type === 'BinaryExpression' && binExpCheckingProd(node) ||
    isBinNeg(node) && binExpCheckingProd(node.argument)

  const binIsProd = (node: BinaryExpression): boolean => ['==', '==='].includes(node.operator)
  const isProd = (node: BinaryExpression | UnaryBinaryExpression): boolean => node.type === 'BinaryExpression' ? binIsProd(node) : !binIsProd(node.argument)

  const isProdVars: {
    /** Whether the variable is `true` if it is production. */
    [variable: string]: boolean
  } = {}

  // eslint-disable-next-line @typescript-eslint/ban-types -- {} is needed for an empty object
  type WithRange<T = {}> = T & {range: [number, number]}

  let newSource = source
  let offset = 0

  const replaceText = (original: WithRange, replacement: string): void => {
    newSource = newSource.slice(0, original.range[0] + offset) +
      replacement +
      newSource.slice(original.range[1] + offset)
    offset += replacement.length - (original.range[1] - original.range[0])
  }

  const remove = (node: WithRange): void => replaceText(node, '')

  const replace = (original: WithRange, replacement: WithRange): void =>
    replaceText(original, newSource.slice(...replacement.range.map(p => p + offset)))

  const parseConditional = (n: acorn.Node): void => {
    const node = n as unknown as WithRange<IfStatement | ConditionalExpression>
    let isTestProd: boolean | undefined
    if (isCheckingProd(node.test)) isTestProd = isProd(node.test)
    else if (node.test.type === 'Identifier') isTestProd = isProdVars[node.test.name]
    else if (isNeg(node.test) && node.test.argument.type === 'Identifier') {
      const _isTestProd = isProdVars[node.test.argument.name] as boolean | undefined
      isTestProd = _isTestProd === undefined ? undefined : !_isTestProd
    }

    if (typeof isTestProd !== 'undefined') {
      const statement = (isTestProd ? node.consequent : node.alternate) as WithRange<Statement | Expression> | undefined
      if (statement) replace(node, statement)
      else remove(node)
    }
  }

  ancestor(parse(source, {ranges: true, locations: true}), {
    /* eslint-disable @typescript-eslint/naming-convention -- these names are needed */
    ConditionalExpression: parseConditional,
    IfStatement: parseConditional,
    VariableDeclarator(n, a) {
      /* eslint-enable @typescript-eslint/naming-convention -- see above */
      const node = n as unknown as WithRange<VariableDeclarator>
      const ancestors = a as WithRange<acorn.Node>[]
      const declaration = ancestors[ancestors.length - 2] as unknown as WithRange<VariableDeclaration> & {
        declarations: WithRange<VariableDeclarator>[]
      }
      const {declarations} = declaration

      if (node.init?.type === 'BinaryExpression' && binExpCheckingProd(node.init) && node.id.type === 'Identifier') {
        isProdVars[node.id.name] = binIsProd(node.init)
        if (declarations.length === 1) remove(declaration)
        else {
          const i = declarations.indexOf(node)
          const next = declarations[i + 1] as WithRange<VariableDeclarator> | undefined
          remove({range: [
            i === declarations.length - 1 ? declarations[i - 1].range[1] : node.range[0],
            next ? next.range[0] : node.range[1]
          ]})
        }
      }
    }
  })

  return newSource
}
