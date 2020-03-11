import base from './rollup.config.base'

export default Object.assign({}, base, {
  output: {
    file: 'dist/vue-chimera.es.js',
    format: 'es',
    name: 'vue-chimera'
  }
})
