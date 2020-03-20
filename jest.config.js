module.exports = {
  testRegex: 'tests/.*\\.test.js$',
  moduleFileExtensions: ['js', 'json', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  setupFiles: ['<rootDir>/tests/unit/index.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}'
  ]
}
