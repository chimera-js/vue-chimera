const { resolve } = require('path')

module.exports = function nuxtChimeraModule (moduleOptions) {

  const options = Object.assign({}, this.options.chimera, moduleOptions)

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'vue-chimera.js',
    options
  })

}

module.exports.meta = require('../package.json')
