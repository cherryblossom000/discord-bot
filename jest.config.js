module.exports = {
  globals: {'ts-jest': {packageJson: './package.json'}},
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts']
}
