module.exports = {
  displayName: 'shared-config',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/shared/config',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {},
};
