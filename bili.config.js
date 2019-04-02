module.exports = {
    input: 'src/index.js',
    output: 'vue-chimera',
    externals: ['axios', 'vue'],
    format: ['cjs','es','umd','umd-min']
}
