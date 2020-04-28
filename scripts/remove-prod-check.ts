import {join} from 'path'
import {promises, statSync} from 'fs'
import {ancestor} from 'acorn-walk'
import {parse} from 'acorn'
import exitOnError from './exitOnError'
import type {
  BinaryExpression, ConditionalExpression, Expression, Identifier,
  IfStatement, Statement, VariableDeclarator, VariableDeclaration
} from 'estree'

const {readdir, readFile, writeFile} = promises

exitOnError()

const removeProdCheck = (source: string): string => {
  const isNodeEnv = (node: Expression): boolean => node.type === 'MemberExpression' && !node.computed &&
    node.object.type === 'MemberExpression' && !node.object.computed &&
    node.object.object.type === 'Identifier' && node.object.object.name === 'process' &&
    (node.object.property as Identifier).name === 'env' &&
    (node.property as Identifier).name === 'NODE_ENV'

  const isProduction = (node: Expression): boolean => node.type === 'Literal' && node.value === 'production'

  const isCheckingIfProd = (node: BinaryExpression): boolean => ['==', '!=', '===', '!=='].includes(node.operator) &&
    (isNodeEnv(node.left) && isProduction(node.right) || isNodeEnv(node.right) && isProduction(node.left))

  const isProd = (node: BinaryExpression): boolean => ['==', '==='].includes(node.operator)

  const isProdVars: {
    /** Whether the variable is `true` if it is production. */
    [variable: string]: boolean
  } = {}

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
    if (node.test.type === 'BinaryExpression' && isCheckingIfProd(node.test)) isTestProd = isProd(node.test)
    else if (node.test.type === 'Identifier') isTestProd = isProdVars[node.test.name]

    if (typeof isTestProd !== 'undefined') {
      const statement = (isTestProd ? node.consequent : node.alternate) as WithRange<Statement | Expression> | undefined
      if (statement) replace(node, statement)
      else remove(node)
    }
  }

  ancestor(parse(source, {ranges: true, locations: true}), {
    /* eslint-disable @typescript-eslint/naming-convention */
    ConditionalExpression: parseConditional,
    IfStatement: parseConditional,
    VariableDeclarator(n, a) {
      /* eslint-enable @typescript-eslint/naming-convention */
      const node = n as unknown as WithRange<VariableDeclarator>,
        ancestors = a as WithRange<acorn.Node>[],
        declaration = ancestors[ancestors.length - 2] as unknown as WithRange<VariableDeclaration> & {
          declarations: WithRange<VariableDeclarator>[]
        },
        {declarations} = declaration

      if (node.init?.type === 'BinaryExpression' && isCheckingIfProd(node.init) && node.id.type === 'Identifier') {
        isProdVars[node.id.name] = isProd(node.init)
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

const walk = async (path: string): Promise<string[]> => {
  const files = (await readdir(path)).map(file => join(path, file))
  ;(await Promise.all(files
    .filter(file => statSync(file).isDirectory())
    .map(async file => walk(file)))
  ).forEach(subFiles => files.push(...subFiles))
  return files
}

walk(join(__dirname, '../dist/src')).then(async files => {
  await Promise.all(files
    .filter(file => file.endsWith('.js'))
    .map(async file => {
      const source = await readFile(file)
      writeFile(file, removeProdCheck(source.toString()))
    }))
})
