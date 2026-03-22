module.exports = {
  displayName: 'application-jobs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/application/jobs',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/domain-jobs$': '<rootDir>/../../domain/jobs/src/index.ts',
  },
};
