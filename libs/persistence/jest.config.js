module.exports = {
  coverageDirectory: '../../coverage/libs/persistence',
  displayName: 'persistence',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  globalSetup: '../../tools/jest/setup.js',
  globalTeardown: '../../tools/jest/teardown.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
};
