module.exports = {
  displayName: 'app-wallet',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/application/wallet',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/domain-wallet$':
      '<rootDir>/../../domain/wallet/src/index.ts',
    '^@ultima-forma/domain-consent$':
      '<rootDir>/../../domain/consent/src/index.ts',
    '^@ultima-forma/domain-claims$':
      '<rootDir>/../../domain/claims/src/index.ts',
    '^@ultima-forma/shared-errors$': '<rootDir>/../../shared/errors/src/index.ts',
  },
};
