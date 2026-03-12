module.exports = {
  displayName: 'drizzle',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/shared-errors$': '<rootDir>/../../shared/errors/src/index.ts',
    '^@ultima-forma/domain-audit$': '<rootDir>/../../domain/audit/src/index.ts',
    '^@ultima-forma/domain-partner$':
      '<rootDir>/../../domain/partner/src/index.ts',
    '^@ultima-forma/domain-consent$':
      '<rootDir>/../../domain/consent/src/index.ts',
  },
};
