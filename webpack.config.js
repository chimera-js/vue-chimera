const path = require('path')

module.exports = {

    entry: {
        'vue-chimera': './src/index.js',
        'vue-chimera-nuxt': './src/NuxtPlugin.js'
    },

    // target: 'node',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',

        libraryTarget: 'umd',
        libraryExport: 'default'
    },

    // externals: {
    //     axios: 'axios',
    //     vue: 'vue'
    // }
}