module.exports = {
  displayName: 'app-consent',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/application/consent',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/domain-audit$': '<rootDir>/../../domain/audit/src/index.ts',
    '^@ultima-forma/domain-consent$':
      '<rootDir>/../../domain/consent/src/index.ts',
    '^@ultima-forma/domain-partner$':
      '<rootDir>/../../domain/partner/src/index.ts',
    '^@ultima-forma/shared-errors$': '<rootDir>/../../shared/errors/src/index.ts',
  },
};
