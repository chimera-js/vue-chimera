import base from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-chimera.min.js',
    format: 'iife',
    name: 'VueChimera',
    globals: {
      axios: 'Axios'
    }
  }
})

config.plugins.push(terser())

export default config
