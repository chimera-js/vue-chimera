import base from './rollup.config.base'

export default Object.assign({}, base, {
  input: 'src/index.es.js',
  output: {
    file: 'dist/vue-chimera.es.js',
    format: 'es',
    name: 'VueChimera'
  }
})
