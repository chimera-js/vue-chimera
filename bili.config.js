module.exports = {
    input: {
        'vue-chimera': './src/index.js',
    },
    output: {
        moduleName: 'vue-chimera',
        fileName: ({ minify, format, ...options }) => {
            if (format === 'umd') format = '';
            return `[name]${format ? '.' + format : ''}${minify ? '.min' : ''}.js`
        },
        format: ['cjs','es','umd','umd-min'],
    },
    externals: ['axios', 'vue'],
    plugins: {
        vue: true,
    }
}
