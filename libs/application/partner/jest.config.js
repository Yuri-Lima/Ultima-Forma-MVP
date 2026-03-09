module.exports = {
  displayName: 'app-partner',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/application/partner',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/domain-partner$':
      '<rootDir>/../../domain/partner/src/index.ts',
    '^@ultima-forma/shared-errors$': '<rootDir>/../../shared/errors/src/index.ts',
  },
};
