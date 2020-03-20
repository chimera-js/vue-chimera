module.exports = {
  afterPublish ({ exec }) {
    exec('yarn report-coverage')
  },
  testCommandBeforeRelease: ({ isYarn }) => isYarn ? 'yarn test' : 'npm run test'
}
