module.exports = {
  rootDir: '.',
  displayName: '@samatech/vue-store',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/lib/**/+(*.)+(spec).+(ts)', '**/test/**/+(*.)+(spec).+(ts)'],
  resetMocks: false,
  setupFiles: ['jest-localstorage-mock'],
}
