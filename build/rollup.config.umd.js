import base from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-chimera.umd.js',
    format: 'umd',
    name: 'VueChimera',
    globals: {
      axios: 'Axios'
    },
    exports: 'auto'
  }
})

config.plugins.push(terser({
  mangle: {
    properties: true
  }
}))

export default config
