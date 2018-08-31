// require all test files
const testsContext = require.context('./', true, /\.test/)
testsContext.keys().forEach(testsContext)
