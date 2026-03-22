module.exports = {
  displayName: 'infrastructure-queue',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/infrastructure/queue',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/domain-jobs$': '<rootDir>/../../domain/jobs/src/index.ts',
    '^@ultima-forma/domain-webhook$':
      '<rootDir>/../../domain/webhook/src/index.ts',
    '^@ultima-forma/shared-logger$':
      '<rootDir>/../../shared/logger/src/index.ts',
    '^@ultima-forma/shared-config$':
      '<rootDir>/../../shared/config/src/index.ts',
  },
};
