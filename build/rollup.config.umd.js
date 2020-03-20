import base from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-chimera.umd.js',
    format: 'umd',
    name: 'VueChimera',
    globals: {
      axios: 'axios'
    },
    exports: 'named'
  }
})

config.plugins.push(terser())

export default config
