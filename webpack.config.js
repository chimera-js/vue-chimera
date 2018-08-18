const path = require('path');

module.exports = [{
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'vue-chimera.browser.js'
    },

    externals: {
        vue: 'Vue'
    }

}, {

    entry: './src/index.js',

    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'vue-chimera.umd.js',

        library: 'VueChimera',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },

    externals: {
        axios: 'axios',
        vue: 'Vue'
    }
},
    {
        entry: './src/NuxtPlugin.js',
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'vue-chimera-nuxt.js',
            libraryTarget: 'umd',
            libraryExport: 'default'
        },
        externals: {
            vue: 'Vue'
        }
    }];