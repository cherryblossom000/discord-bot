const rules = {
  // Possible Errors
  'no-await-in-loop': 2,
  'no-extra-parens': 1,
  'no-cond-assign': 0,
  'no-constant-condition': [2, {checkLoops: false}],
  'no-dupe-else-if': 2,
  'no-empty': [1, {allowEmptyCatch: true}],
  'no-extra-semi': 1,
  'no-import-assign': 2,
  'no-inner-declarations': [2, 'both'],
  'no-irregular-whitespace': [2, {skipComments: false}],
  'no-setter-return': 2,
  'no-template-curly-in-string': 1,
  'no-unsafe-negation': [2, {enforceForOrderingRelations: true}],
  'require-atomic-updates': 2,
  'use-isnan': [2, {enforceForSwitchCase: true, enforceForIndexOf: true}],

  // Best Practices
  'accessor-pairs': [1, {enforceForClassMembers: true}],
  'array-callback-return': 2,
  'class-methods-use-this': 2,
  complexity: 1,
  'consistent-return': 2,
  curly: [1, 'multi-or-nest'],
  'default-param-last': 2,
  'dot-location': [1, 'property'],
  'dot-notation': 1,
  eqeqeq: [2, 'smart'],
  'grouped-accessor-pairs': [1, 'getBeforeSet'],
  'guard-for-in': 2,
  'no-caller': 2,
  'no-constructor-return': 2,
  'no-else-return': [1, {allowElseIf: false}],
  'no-empty-function': 1,
  'no-eval': 2,
  'no-extend-native': 2,
  'no-extra-bind': 2,
  'no-extra-label': 1,
  'no-fallthrough': 0,
  'no-implicit-globals': 2,
  'no-implied-eval': 2,
  'no-invalid-this': 2,
  'no-iterator': 2,
  'no-labels': [2, {allowLoop: true, allowSwitch: true}],
  'no-lone-blocks': 2,
  'no-loop-func': 2,
  'no-multi-spaces': [1, {}],
  'no-multi-str': 2,
  'no-new': 2,
  'no-new-wrappers': 2,
  'no-octal': 2,
  'no-octal-escape': 2,
  'no-proto': 2,
  'no-return-await': 2,
  'no-script-url': 2,
  'no-self-compare': 2,
  'no-sequences': 2,
  'no-throw-literal': 2,
  'no-unmodified-loop-condition': 2,
  'no-unused-expressions': [1, {allowTernary: true, allowTaggedTemplates: true}],
  'no-unused-labels': 1,
  'no-useless-call': 2,
  'no-useless-concat': 2,
  'no-useless-return': 1,
  'no-void': 2,
  'prefer-promise-reject-errors': 2,
  'prefer-regex-literals': 2,
  radix: [1, 'as-needed'],
  'require-await': 2,
  'require-unicode-regexp': 2,
  'vars-on-top': 2,
  'wrap-iife': [1, 'inside'],
  yoda: 1,

  // Strict Mode
  strict: 2,

  // Variables
  'no-label-var': 1,
  'no-shadow': [2, {builtinGlobals: true}],
  'no-undef-init': 2,
  'no-unused-vars': [1, {
    ignoreRestSiblings: true,
    args: 'all',
    argsIgnorePattern: '^_',
    caughtErrors: 'all',
    caughtErrorsIgnorePattern: '^_'
  }],
  'no-use-before-define': [2, 'nofunc'],

  // Stylistic Issues
  'array-bracket-newline': [1, 'consistent'],
  'array-bracket-spacing': 1,
  'array-element-newline': [1, 'consistent'],
  'block-spacing': [1, 'never'],
  'brace-style': 1,
  camelcase: 1,
  'comma-dangle': 1,
  'comma-spacing': 1,
  'comma-style': 1,
  'computed-property-spacing': [1, 'never', {enforceForClassMembers: true}],
  'eol-last': 1,
  'func-call-spacing': 1,
  'func-name-matching': [1, {considerPropertyDescriptor: true}],
  'func-names': [1, 'as-needed'],
  'func-style': 1,
  'function-call-argument-newline': [1, 'consistent'],
  'function-paren-newline': [1, 'consistent'],
  'id-length': [1, {min: 1, max: 30}],
  indent: [1, 2, {SwitchCase: 1, flatTernaryExpressions: true}],
  'jsx-quotes': [1, 'prefer-single'],
  'key-spacing': 1,
  'keyword-spacing': 1,
  'line-comment-position': [1, {position: 'above', applyDefaultIgnorePatterns: false}],
  'linebreak-style': 1,
  'max-depth': 1,
  'max-len': [1, {code: 125, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true}],
  'max-lines': [1, {max: 500, skipBlankLines: true, skipComments: true}],
  'max-lines-per-function': [1, {max: 100, skipBlankLines: true, skipComments: true}],
  'max-nested-callbacks': 1,
  'max-params': [1, {max: 5}],
  'max-statements': [1, 20, {ignoreTopLevelFunctions: true}],
  'max-statements-per-line': 1,
  'multiline-comment-style': 0,
  'new-cap': 1,
  'new-parens': 1,
  'newline-per-chained-call': [1, {ignoreChainWithDepth: 4}],
  'no-array-constructor': 1,
  'no-inline-comments': 1,
  'no-lonely-if': 1,
  'no-multi-assign': 2,
  'no-multiple-empty-lines': [1, {max: 1, maxBOF: 0}],
  'no-negated-condition': 1,
  'no-new-object': 1,
  'no-tabs': 1,
  'no-trailing-spaces': 1,
  'no-unneeded-ternary': [2, {defaultAssignment: false}],
  'no-whitespace-before-property': 1,
  'object-curly-newline': 1,
  'object-curly-spacing': 1,
  'object-property-newline': [1, {allowAllPropertiesOnSameLine: true}],
  'one-var-declaration-per-line': 1,
  'operator-assignment': 1,
  'operator-linebreak': [1, 'after', {overrides: {'?': 'before', ':': 'before', '|>': 'before'}}],
  'padded-blocks': [1, 'never'],
  'padding-line-between-statements': [1,
    {blankLine: 'always', prev: 'directive', next: '*'},
    {blankLine: 'never', prev: 'directive', next: 'directive'},
    {blankLine: 'always', prev: ['cjs-import', 'import'], next: '*'},
    {blankLine: 'never', prev: ['cjs-import', 'import'], next: ['cjs-import', 'import']},
    {blankLine: 'always', prev: ['cjs-export', 'export'], next: '*'},
    {blankLine: 'any', prev: ['cjs-export', 'export'], next: ['cjs-export', 'export']},
    {blankLine: 'always', prev: 'function', next: '*'}
  ],
  'prefer-exponentiation-operator': 1,
  'prefer-object-spread': 1,
  'quote-props': [1, 'as-needed'],
  quotes: [1, 'single', {avoidEscape: true}],
  semi: [1, 'never'],
  'semi-spacing': 1,
  'semi-style': [1, 'first'],
  'space-before-blocks': 1,
  'space-before-function-paren': [1, {named: 'never'}],
  'space-in-parens': 1,
  'space-infix-ops': [1, {int32Hint: true}],
  'space-unary-ops': [1, {words: true, nonwords: false}],
  'spaced-comment': [1, 'always', {line: {markers: ['/']}, block: {markers: ['*'], balanced: true}}],
  'switch-colon-spacing': 1,
  'template-tag-spacing': 1,
  'unicode-bom': 1,

  // ECMAScript 6
  'arrow-body-style': 1,
  'arrow-parens': [1, 'as-needed'],
  'arrow-spacing': 1,
  'generator-star-spacing': [1, {before: false, after: true, method: 'before'}],
  'no-duplicate-imports': 1,
  'no-useless-computed-key': 1 /* [1, {enforceForClassMembers: true}] */,
  'no-useless-constructor': 1,
  'no-useless-rename': 1,
  'no-var': 2,
  'object-shorthand': 1,
  'prefer-arrow-callback': 1,
  'prefer-const': 2,
  'prefer-destructuring': 1,
  'prefer-numeric-literals': 2,
  'prefer-rest-params': 2,
  'prefer-spread': 2,
  'prefer-template': 2,
  'rest-spread-spacing': 1,
  'symbol-description': 2,
  'template-curly-spacing': 1,
  'yield-star-spacing': 1,

  // Node.js and CommonJS
  'callback-return': 2,
  'global-require': 2,
  'handle-callback-err': [2, '^err(or)?'],
  'no-buffer-constructor': 2,
  'no-mixed-requires': [2, {allowCall: true}],
  'no-new-require': 2,
  'no-path-concat': 2,
  'no-process-exit': 2
}

module.exports = {
  env: {
    es2017: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {'ecmaVersion': 10},
  ignorePatterns: ['dist/', 'doc/'],
  overrides: [
    {
      files: ['tests/**/*.test.ts'],
      env: {'jest': true}
    },
    {
      files: ['scripts/**/*'],
      rules: {
        'no-process-exit': 0
      }
    },
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      env: {es2020: true},
      parser: '@typescript-eslint/parser',
      parserOptions: {project: './tsconfig.json'},
      rules: {
        '@typescript-eslint/adjacent-overload-signatures': 1,
        '@typescript-eslint/array-type': 1,
        '@typescript-eslint/ban-ts-comment': 2,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/ban-types': [2, {types: {Function: {
          message: 'Use (...args: any[]) => any instead.',
          fixWith: '(...args: any[]) => any'
        }}}],
        '@typescript-eslint/class-literal-property-style': 2,
        '@typescript-eslint/consistent-type-assertions': 2,
        '@typescript-eslint/consistent-type-definitions': [1, 'interface'],
        '@typescript-eslint/explicit-function-return-type': 2,
        '@typescript-eslint/explicit-member-accessibility': [1, {accessibility: 'no-public'}],
        '@typescript-eslint/explicit-module-boundary-types': 2,
        '@typescript-eslint/member-delimiter-style': [1, {
          singleline: {delimiter: 'comma'},
          multiline: {delimiter: 'none'}
        }],
        '@typescript-eslint/member-ordering': 1,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/class-name-casing': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/naming-convention': [1,
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
          },
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
          },
          {
            selector: 'property',
            format: ['camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
          },
          {
            selector: 'enumMember',
            format: ['UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
          }],
        '@typescript-eslint/no-base-to-string': 2,
        '@typescript-eslint/no-dynamic-delete': 2,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-extra-non-null-assertion': 2,
        '@typescript-eslint/no-extraneous-class': 2,
        '@typescript-eslint/no-floating-promises': [2, {ignoreIIFE: true}],
        'no-implied-eval': 0,
        '@typescript-eslint/no-implied-eval': 2,
        '@typescript-eslint/no-inferrable-types': 2,
        '@typescript-eslint/no-misused-promises': [2, {checksVoidReturn: false}],
        '@typescript-eslint/no-non-null-asserted-optional-chain': 2,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-require-imports': 2,
        '@typescript-eslint/no-this-alias': 2,
        'no-throw-literal': 0,
        '@typescript-eslint/no-throw-literal': 2,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
        '@typescript-eslint/no-unnecessary-condition': [2, {allowConstantLoopConditions: true, checkArrayPredicates: true}],
        '@typescript-eslint/no-unnecessary-qualifier': 2,
        '@typescript-eslint/no-unnecessary-type-arguments': 1,
        '@typescript-eslint/prefer-as-const': 2,
        '@typescript-eslint/prefer-for-of': 2,
        '@typescript-eslint/prefer-function-type': 2,
        '@typescript-eslint/prefer-nullish-coalescing': 2,
        '@typescript-eslint/prefer-optional-chain': 2,
        '@typescript-eslint/prefer-readonly': 2,
        '@typescript-eslint/promise-function-async': 2,
        '@typescript-eslint/type-annotation-spacing': 1,
        '@typescript-eslint/unbound-method': [2, {ignoreStatic: true}],
        '@typescript-eslint/unified-signatures': 2,

        // Extension Rules
        'brace-style': 0,
        '@typescript-eslint/brace-style': rules['brace-style'],
        'comma-spacing': 0,
        '@typescript-eslint/comma-spacing': rules['comma-spacing'],
        'default-param-last': 0,
        '@typescript-eslint/default-param-last': rules['default-param-last'],
        'func-call-spacing': 0,
        '@typescript-eslint/func-call-spacing': rules['func-call-spacing'],
        indent: 0,
        '@typescript-eslint/indent': rules.indent,
        'no-array-constructor': 0,
        '@typescript-eslint/no-array-constructor': rules['no-array-constructor'],
        'no-empty-function': 0,
        '@typescript-eslint/no-empty-function': [rules['no-empty-function'], {
          allow: ['protected-constructors', 'private-constructors']
        }],
        'no-extra-parens': 0,
        '@typescript-eslint/no-extra-parens': rules['no-extra-parens'],
        'no-extra-semi': 0,
        '@typescript-eslint/no-extra-semi': rules['no-extra-semi'],
        'no-unused-expressions': 0,
        '@typescript-eslint/no-unused-expressions': rules['no-unused-expressions'],
        'no-useless-constructor': 0,
        '@typescript-eslint/no-useless-constructor': rules['no-useless-constructor'],
        quotes: 0,
        '@typescript-eslint/quotes': rules.quotes,
        'require-await': 0,
        '@typescript-eslint/require-await': rules['require-await'],
        'no-return-await': 0,
        '@typescript-eslint/return-await': rules['no-return-await'],
        semi: 0,
        '@typescript-eslint/semi': rules.semi,
        'space-before-function-paren': 0,
        '@typescript-eslint/space-before-function-paren': rules['space-before-function-paren'],

        // Already checked by TS
        'array-callback-return': 0,
        'consistent-return': 0,
        'constructor-super': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-use-before-define': 0,

        // Doesn't work with import type
        'no-duplicate-imports': 0
      }
    },
    {
      files: ['@(scripts|src)/**/*.ts'],
      rules: {
        // Everything is handled anyway
        '@typescript-eslint/no-floating-promises': 0
      }
    },
    {
      files: ['tests/mock/**/*.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 0,
        '@typescript-eslint/require-await': 0
      }
    }
  ],
  rules
}