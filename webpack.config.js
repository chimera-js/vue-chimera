const path = require('path')

module.exports = {

    entry: {
        'vue-chimera': './src/index.js',
        'vue-chimera-nuxt': './src/NuxtPlugin.js'
    },

    target: 'node',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',

        libraryExport: 'default',
        libraryTarget: 'umd'
    }

}