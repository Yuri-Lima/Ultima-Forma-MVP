module.exports = {
  displayName: 'app-claims',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/application/claims',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/domain-claims$':
      '<rootDir>/../../domain/claims/src/index.ts',
    '^@ultima-forma/shared-errors$': '<rootDir>/../../shared/errors/src/index.ts',
  },
};
