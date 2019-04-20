const chai = require('chai')
chai.use(require('chai-as-promised'));

// require all test files
const testsContext = require.context('./', true, /\.test/)
testsContext.keys().forEach(testsContext)
