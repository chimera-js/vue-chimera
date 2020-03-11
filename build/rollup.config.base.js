import babel from 'rollup-plugin-babel'
import cjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    cjs({
      exclude: 'src/**'
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external: ['axios']
}
