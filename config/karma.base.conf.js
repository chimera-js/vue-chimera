const webpackConfig = {
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    devtool: '#inline-source-map'
}

module.exports = {
    frameworks: ['mocha'],
    files: [
        '../test/unit/index.js'
    ],
    preprocessors: {
        '../test/unit/index.js': ['webpack', 'sourcemap']
    },
    webpack: Object.assign({}, webpackConfig),
    webpackMiddleware: {
        noInfo: true
    },
    plugins: [
        'karma-mocha',
        'karma-mocha-reporter',
        'karma-sourcemap-loader',
        'karma-webpack'
    ]
}