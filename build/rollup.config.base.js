import babel from 'rollup-plugin-babel'
import cjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      mainFields: ['jsnext', 'main', 'browser']
    }),
    cjs({
      exclude: ['src/*', 'src/components/*']
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external: ['axios']
}
