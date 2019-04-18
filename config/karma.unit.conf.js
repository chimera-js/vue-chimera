const base = require('./karma.base.conf')

module.exports = config => {
    config.set(Object.assign(base, {
        browsers: [
            'Chrome',
            // 'Firefox',
            // 'Safari'
        ],
        reporters: ['progress', 'coverage-istanbul'],
        singleRun: true,
        plugins: base.plugins.concat([
            'karma-chrome-launcher',
            // 'karma-firefox-launcher',
            // 'karma-safari-launcher'
        ])
    }))
}
