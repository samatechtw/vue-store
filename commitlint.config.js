// eslint-disable-next-line @typescript-eslint/no-var-requires
const typeEnum = require('@commitlint/config-angular-type-enum')

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [2, 'always', [...typeEnum.value(), 'release']],
  },
}
