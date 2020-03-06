module.exports = {
  globals: {'ts-jest': {packageJson: './package.json'}},
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts']
}
