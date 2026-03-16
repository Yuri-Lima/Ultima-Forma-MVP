module.exports = {
  displayName: 'infrastructure-feature-flags',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/infrastructure/feature-flags',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@ultima-forma/shared-config$':
      '<rootDir>/../../shared/config/src/index.ts',
  },
};
